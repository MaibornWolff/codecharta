import md5 from "md5"
import { AttributeTypes, CodeMapNode, Edge, FixedPosition, NodeType } from "../../codeCharta.model"
import { ExportWrappedCCFile } from "../../codeCharta.api.model"

export interface GameObject {
	name: string
	position: Coordinates
	scale: Coordinates
}

export interface Coordinates {
	x: number
	y: number
	z: number
}

export interface Cycle {
	from: string
	to: string
}
const BASE_NAME = "base"

export function parseGameObjectsFile(data) {
	const { gameObjectPositions: gameObjects, cycles = [] } = JSON.parse(data)

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
	fixGameObjectNames(gameObjects)

	const rootGameObjectPosition = gameObjects.find(gameObject => gameObject.name === "root")
	gameObjects.push(createBaseGameObjectPosition(rootGameObjectPosition))

	for (const gameObjectPosition of gameObjects) {
		const nodeNames = gameObjectPosition.name.split(".")
		if (nodeNames[0] !== BASE_NAME) {
			addNodeRecursively(nodeNames, nodes[0].children, BASE_NAME, gameObjectPosition, gameObjects, rootGameObjectPosition)
		}
	}

	ccJson.data.nodes = nodes
	ccJson.data.edges = cycles.map(cycle => createEdge(cycle))
	ccJson.data.attributeTypes = createAttributeTypes()
	ccJson.checksum = md5(JSON.stringify(ccJson.data))
	return ccJson
}

function fixGameObjectNames(gameObjects: GameObject[]) {
	for (const gameObjectPosition of gameObjects) {
		if (!gameObjectPosition.name.startsWith("root")) {
			gameObjectPosition.name = gameObjectPosition.name.startsWith(".")
				? `root${gameObjectPosition.name}`
				: `root.${gameObjectPosition.name}`
		}
	}
}

function addNodeRecursively(
	nodeNames: string[],
	nodes: CodeMapNode[],
	parentNodeName: string,
	gameObject: GameObject,
	gameObjects: GameObject[],
	rootGameObject: GameObject
) {
	if (nodeNames.length === 0) {
		return
	}

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
		node = wrapFileInAFolder(nodeName, node, gameObject)
	}

	// add or select node if found
	if (!nodeAlreadyExists(nodes, nodeName)) {
		nodes.push(node)
	} else {
		node = nodes.find(singleNode => singleNode.name === nodeName)
	}

	const parentGameObject = gameObjects.find(gameObject => gameObject.name === parentNodeName)
	node.fixedPosition = calculateFixedFolderPosition(node, parentGameObject, gameObject, rootGameObject.name)

	const newParentName = parentNodeName === BASE_NAME ? node.name : `${parentNodeName}.${node.name}`
	addNodeRecursively(nodeNames.slice(1), node.children, newParentName, gameObject, gameObjects, rootGameObject)
}

function isFile(names: string[]) {
	return names.length === 1
}

function nodeAlreadyExists(nodes: CodeMapNode[], name: string) {
	return nodes.some(singleNode => singleNode.name === name)
}

function wrapFileInAFolder(nodeName: string, node: CodeMapNode, gameObject: GameObject): CodeMapNode {
	const childNode = { ...node }
	childNode.attributes = { height: gameObject.scale.y }
	return { name: nodeName, type: NodeType.FOLDER, attributes: {}, children: [childNode] }
}

function calculateFixedFolderPosition(
	node: CodeMapNode,
	parentGameObject: GameObject,
	childGameObject: GameObject,
	rootGameObjectPositionName: string
): FixedPosition {
	let position: FixedPosition

	if (node.type === NodeType.FOLDER) {
		// translate the center point from the middle of the gameObject to the corner as needed for fixedPosition
		const cornerXofParent = parentGameObject.position.x - parentGameObject.scale.x / 2
		const cornerZofParent = parentGameObject.position.z - parentGameObject.scale.z / 2
		const cornerXofChild = childGameObject.position.x - childGameObject.scale.x / 2
		const cornerZofChild = childGameObject.position.z - childGameObject.scale.z / 2
		const top = round(((cornerXofChild - cornerXofParent) / parentGameObject.scale.x) * 100, 2)
		const left = round(((cornerZofChild - cornerZofParent) / parentGameObject.scale.z) * 100, 2)
		const width = round((childGameObject.scale.z / parentGameObject.scale.z) * 100, 2)
		const height = round((childGameObject.scale.x / parentGameObject.scale.x) * 100, 2)
		position = { left, top, width, height }
	}

	if (node.name === rootGameObjectPositionName) {
		position = getCenteredRootPosition(position)
	}

	return position
}

function round(value: number, decimalPoints: number): number {
	const roundingValue = Math.pow(10, decimalPoints)
	return Math.round(value * roundingValue) / roundingValue
}

function getCenteredRootPosition(rootGameObject: FixedPosition): FixedPosition {
	const centeredPosition: FixedPosition = { ...rootGameObject }
	centeredPosition.top = Math.floor(50 - centeredPosition.height / 2)
	centeredPosition.left = 0
	return centeredPosition
}

function addWrappedFolderName(filePath: string): string {
	const splitFilePath = filePath.split(".")
	return `/${BASE_NAME}/${filePath.replace(/\./g, "/")}/${splitFilePath.slice(-1)}`
}

function createEdge(cycle: Cycle): Edge {
	return {
		fromNodeName: addWrappedFolderName(cycle.from),
		toNodeName: addWrappedFolderName(cycle.to),
		attributes: {
			coupling: 100
		}
	}
}

function createAttributeTypes(): AttributeTypes {
	return {
		edges: {
			coupling: "relative"
		}
	} as AttributeTypes
}

function createBaseGameObjectPosition(rootGameObjectPosition): GameObject {
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
	}
}
