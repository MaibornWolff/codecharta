import md5 from "md5"

function isFile(names) {
	return names.length === 0
}

function nodeAlreadyExists(nodes, name) {
	return nodes.some(node => node.name === name)
}

function calculateFixedFolderPosition(node, name, parent, gameObjectPosition) {
	if (node.type === "Folder" && name !== "base") {
		const cornerXofParent = parent.position.x - parent.scale.x / 2
		const cornerZofParent = parent.position.z - parent.scale.z / 2
		const cornerXofChild = gameObjectPosition.position.x - gameObjectPosition.scale.x / 2
		const cornerZofChild = gameObjectPosition.position.z - gameObjectPosition.scale.z / 2
		const top = Math.floor(((cornerXofChild - cornerXofParent) / parent.scale.x) * 100)
		const left = Math.floor(((cornerZofChild - cornerZofParent) / parent.scale.z) * 100)
		const width = Math.floor((gameObjectPosition.scale.z / parent.scale.z) * 100)
		const height = Math.floor((gameObjectPosition.scale.x / parent.scale.x) * 100)
		node.fixedPosition = { left, top, width, height }
	}
	if (name === "root") {
		node.fixedPosition.top = Math.floor(50 - node.fixedPosition.height / 2)
		node.fixedPosition.left = 0
	}
}

function addNodeRecursively(names, nodes, gameObjectPosition, parentNodeName, gameObjectPositions) {
	if (names.length === 0) return
	// get current path name
	const name = names.shift()
	let node

	// create node
	node = { name, type: isFile(names) ? "File" : "Folder", attributes: {} }
	if (!isFile(names)) node.children = []

	// wrap file
	if (isFile(names)) {
		const childNode = { ...node }
		childNode.attributes = { height: gameObjectPosition.scale.y }
		node = { name, type: "Folder", attributes: {}, children: [childNode] }
	}

	// add or select node
	if (!nodeAlreadyExists(nodes, name)) {
		nodes.push(node)
	} else {
		node = nodes.find(node => node.name === name)
	}

	const parent = gameObjectPositions.find(gameObject => gameObject.name === parentNodeName)

	// set Position
	calculateFixedFolderPosition(node, name, parent, gameObjectPosition)

	const newParentName = parentNodeName === "base" ? node.name : `${parentNodeName}.${node.name}`
	addNodeRecursively(names, node.children, gameObjectPosition, newParentName, gameObjectPositions)
	return
}

function addWrappedFolderName(filePath) {
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
	}
}

function createAttributeTypes() {
	return {
		edges: {
			coupling: "relative"
		}
	}
}

export function parseGameObjectsFile(data) {
	const { gameObjectPositions, cycles } = JSON.parse(data)

	const ccJson = {
		checksum: "",
		data: {
			projectName: "ScriptProjectName",
			fileChecksum: "",
			apiVersion: "1.3",
			nodes: []
		}
	}

	const nodes = []
	const edges = []

	// we add a dummy node so that base and root folders don't get merged and the fixed position of root won't be ignored
	const dummyNode = {
		name: "dummy",
		type: "Folder",
		attributes: {},
		children: [],
		fixedPosition: { top: 0, left: 0, width: 0, height: 0 }
	}
	nodes.push({ name: "base", type: "Folder", attributes: {}, children: [dummyNode] })

	const rootGamePosition = gameObjectPositions.find(gameObject => gameObject.name === "root")
	const longEdge = Math.max(rootGamePosition.scale.x, rootGamePosition.scale.z)
	gameObjectPositions.push({
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
	})

	for (const gameObjectPosition of gameObjectPositions) {
		const names = gameObjectPosition.name.split(".")
		if (names[0] !== "base") {
			addNodeRecursively(names, nodes[0].children, gameObjectPosition, "base", gameObjectPositions)
		}
	}

	if (cycles) {
		for (const cycle of cycles) {
			edges.push(createEdge(cycle))
		}
	}
	ccJson.data.nodes = nodes
	ccJson.data["edges"] = edges
	ccJson.data["attributeTypes"] = createAttributeTypes()
	ccJson.checksum = md5(JSON.stringify(ccJson.data))
	return ccJson
}
