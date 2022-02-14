import md5 from "md5"
import { AttributeTypes, CodeMapNode, Edge, FixedPosition, NodeType } from "../../codeCharta.model"
import { ExportWrappedCCFile } from "../../codeCharta.api.model"

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

	const nodes = [{ name: "base", type: NodeType.FOLDER, attributes: {}, children: [] }]
	gameObjectPositions.push(createBaseGameObjectPosition(gameObjectPositions))

	for (const gameObjectPosition of gameObjectPositions) {
		const nodeNames = gameObjectPosition.name.split(".")
		if (nodeNames[0] !== "base") {
			addNodeRecursively(nodeNames, nodes[0].children, "base", gameObjectPosition, gameObjectPositions)
		}
	}

	ccJson.data.nodes = nodes
	ccJson.data.edges = cycles.map(cycle => createEdge(cycle))
	ccJson.data.attributeTypes = createAttributeTypes()
	ccJson.checksum = md5(JSON.stringify(ccJson.data))
	return ccJson
}

function addNodeRecursively(nodeNames: string[], nodes: CodeMapNode[], parentNodeName: string, gameObjectPosition, gameObjectPositions) {
	if (nodeNames.length === 0) return

	// get current node name and create cc node structure
	const [nodeName] = nodeNames
	let node: CodeMapNode = {
		name: nodeName,
		type: isFile(nodeNames) ? NodeType.FILE : NodeType.FOLDER,
		attributes: {}
	}
	if (!isFile(nodeNames)) node.children = []
	if (isFile(nodeNames)) node = wrapFileInAFolder(nodeName, node, gameObjectPosition)

	// add or select node if found
	if (!nodeAlreadyExists(nodes, nodeName)) {
		nodes.push(node)
	} else {
		node = nodes.find(singleNode => singleNode.name === nodeName)
	}

	const parent = gameObjectPositions.find(gameObject => gameObject.name === parentNodeName)
	node.fixedPosition = calculateFixedFolderPosition(node, nodeName, parent, gameObjectPosition)

	const newParentName = parentNodeName === "base" ? node.name : `${parentNodeName}.${node.name}`
	addNodeRecursively(nodeNames.slice(1), node.children, newParentName, gameObjectPosition, gameObjectPositions)
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

function calculateFixedFolderPosition(node: CodeMapNode, name: string, parentGameObject, childGameObject) {
	let position: FixedPosition
	if (node.type === NodeType.FOLDER && name !== "base") {
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
	if (name === "root") {
		position.top = Math.floor(50 - position.height / 2)
		position.left = 0
	}
	return position
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

function createBaseGameObjectPosition(gameObjectPositions) {
	const rootGamePosition = gameObjectPositions.find(gameObject => gameObject.name === "root")
	const longEdge = Math.max(rootGamePosition.scale.x, rootGamePosition.scale.z)
	return {
		name: "base",
		position: {
			x: 0,
			y: 0,
			z: 0
		},
		scale: {
			x: longEdge,
			y: 1,
			z: longEdge
		}
	}
}
