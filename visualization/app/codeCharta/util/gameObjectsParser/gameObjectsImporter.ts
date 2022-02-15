import md5 from "md5"
import { AttributeTypes, CodeMapNode, Edge, FixedPosition, NodeType } from "../../codeCharta.model"
import { ExportWrappedCCFile } from "../../codeCharta.api.model"

export interface BaseNode {
	name: string
	position: Position
	scale: Position
}

export interface Position {
	x: number
	y: number
	z: number
}

const BASE_NAME = "base"

export function parseGameObjectsFile(data) {
	const { gameObjectPositions, cycles = [] } = JSON.parse(data)

	const ccJson: ExportWrappedCCFile = {
		checksum: "",
		data: {
			projectName: "ScriptProjectName",
			fileChecksum: "",
			apiVersion: "1.3",
			nodes: []
		}
	}

	const nodes = [{ name: BASE_NAME, type: NodeType.FOLDER, attributes: {}, children: [] }]
	const rootGameObjectPosition = gameObjectPositions.find(gameObject => gameObject.name.split(".").length === 1)

	gameObjectPositions.push(createBaseGameObjectPosition(rootGameObjectPosition))

	for (const gameObjectPosition of gameObjectPositions) {
		const nodeNames = gameObjectPosition.name.split(".")
		if (nodeNames[0] !== BASE_NAME) {
			addNodeRecursively(nodeNames, nodes[0].children, BASE_NAME, gameObjectPosition, gameObjectPositions, rootGameObjectPosition)
		}
	}

	ccJson.data.nodes = nodes
	ccJson.data.edges = cycles.map(cycle => createEdge(cycle))
	ccJson.data.attributeTypes = createAttributeTypes()
	ccJson.checksum = md5(JSON.stringify(ccJson.data))
	return ccJson
}

function addNodeRecursively(
	nodeNames: string[],
	nodes: CodeMapNode[],
	parentNodeName: string,
	gameObjectPosition,
	gameObjectPositions,
	rootGameObjectPosition
) {
	if (nodeNames.length === 0) return

	// get current node name and create cc node structure
	const [nodeName] = nodeNames
	let node: CodeMapNode = {
		name: nodeName,
		type: isFile(nodeNames) ? NodeType.FILE : NodeType.FOLDER,
		attributes: {}
	}

	if (!isFile(nodeNames)) {
		node.children = []
	} else {
		node = wrapFileInAFolder(nodeName, node, gameObjectPosition)
	}

	// add or select node if found
	if (!nodeAlreadyExists(nodes, nodeName)) {
		nodes.push(node)
	} else {
		node = nodes.find(singleNode => singleNode.name === nodeName)
	}

	const parentGameObject = gameObjectPositions.find(gameObject => gameObject.name === parentNodeName)
	node.fixedPosition = calculateFixedFolderPosition(node, parentGameObject, gameObjectPosition, rootGameObjectPosition.name)

	const newParentName = parentNodeName === BASE_NAME ? node.name : `${parentNodeName}.${node.name}`
	addNodeRecursively(nodeNames.slice(1), node.children, newParentName, gameObjectPosition, gameObjectPositions, rootGameObjectPosition)
}

function isFile(names: string[]) {
	return names.length === 1
}

function nodeAlreadyExists(nodes: CodeMapNode[], name: string) {
	return nodes.some(singleNode => singleNode.name === name)
}

function wrapFileInAFolder(nodeName: string, node: CodeMapNode, gameObjectPosition) {
	const childNode = { ...node }
	childNode.attributes = { height: gameObjectPosition.scale.y }
	const parentNode: CodeMapNode = { name: nodeName, type: NodeType.FOLDER, attributes: {}, children: [childNode] }
	return parentNode
}

function calculateFixedFolderPosition(node: CodeMapNode, parentGameObject, childGameObject, rootGameObjectPositionName: string) {
	let position: FixedPosition

	if (node.type === NodeType.FOLDER) {
		// translate the center point from the middle of the gameObject to the corner as needed for fixedPosition
		const cornerXofParent = parentGameObject.position.x - parentGameObject.scale.x / 2
		const cornerZofParent = parentGameObject.position.z - parentGameObject.scale.z / 2
		const cornerXofChild = childGameObject.position.x - childGameObject.scale.x / 2
		const cornerZofChild = childGameObject.position.z - childGameObject.scale.z / 2
		const top = Math.floor(((cornerXofChild - cornerXofParent) / parentGameObject.scale.x) * 100)
		const left = Math.floor(((cornerZofChild - cornerZofParent) / parentGameObject.scale.z) * 100)
		const width = Math.floor((childGameObject.scale.z / parentGameObject.scale.z) * 100)
		const height = Math.floor((childGameObject.scale.x / parentGameObject.scale.x) * 100)
		position = { left, top, width, height }
	}

	if (node.name === rootGameObjectPositionName) {
		centerRootPosition(position)
	}

	return position
}

function centerRootPosition(rootPosition) {
	rootPosition.top = Math.floor(50 - rootPosition.height / 2)
	rootPosition.left = 0
}

function addWrappedFolderName(filePath: string) {
	const splitFilePath = filePath.split(".")
	return `/base/${filePath.replace(/\./g, "/")}/${splitFilePath.slice(-1)}`
}

function createEdge(cycle) {
	return {
		fromNodeName: addWrappedFolderName(cycle.from),
		toNodeName: addWrappedFolderName(cycle.to),
		attributes: {
			coupling: 100
		}
	} as Edge
}

function createAttributeTypes() {
	return {
		edges: {
			coupling: "relative"
		}
	} as AttributeTypes
}

function createBaseGameObjectPosition(rootGameObjectPosition) {
	const longEdge = Math.max(rootGameObjectPosition.scale.x, rootGameObjectPosition.scale.z)
	return {
		name: BASE_NAME,
		position: {
			x: 0,
			y: 0,
			z: 0
		},
		scale: {
			x: longEdge,
			y: 0,
			z: longEdge
		}
	} as BaseNode
}
