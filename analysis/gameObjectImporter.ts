// @ts-ignore
const fs = require("fs")

function isFile(names) {
	return names.length === 0
}

function outputCCJsonFile(ccJson) {
	const ccJsonString = JSON.stringify(ccJson, null, 4)
	fs.writeFileSync("./Output.cc.json", ccJsonString, "utf8")
	console.log(`File is written successfully!`)
}

function nodeAlreadyExists(nodes, name) {
	return nodes.some(node => node.name === name)
}

function addNodeRecursively(names, nodes, gameObjectPosition, parentNodeName, gameObjectPositions) {
	if (names.length === 0) return
	// get current path name
	const name = names.shift()
	let node

	// create node
	node = { name: name, type: isFile(names) ? "File" : "Folder", attributes: {} }
	if (!isFile(names)) node["children"] = []

	// wrap file
	if (isFile(names)) {
		const childNode = { ...node }
		childNode.attributes = { height: gameObjectPosition.scale.y }
		node = { name: name, type: "Folder", attributes: {}, children: [childNode] }
	}

	// add or select node
	if (!nodeAlreadyExists(nodes, name)) {
		nodes.push(node)
	} else {
		node = nodes.find(node => node["name"] == name)
	}

	const parent = gameObjectPositions.find(gameObject => gameObject["name"] == parentNodeName)

	// set Position
	if (node.type === "Folder" && name !== "root") {
		const cornerXofParent = parent.position.x - parent.scale.x / 2
		const cornerZofParent = parent.position.z - parent.scale.z / 2
		const cornerXofChild = gameObjectPosition.position.x - gameObjectPosition.scale.x / 2
		const cornerZofChild = gameObjectPosition.position.z - gameObjectPosition.scale.z / 2
		const left = Math.floor(((cornerXofChild - cornerXofParent) / parent.scale.x) * 100)
		const top = Math.floor(((cornerZofChild - cornerZofParent) / parent.scale.z) * 100)
		const width = Math.floor((gameObjectPosition.scale.x / parent.scale.x) * 100)
		const height = Math.floor((gameObjectPosition.scale.z / parent.scale.z) * 100)

		node["fixedPosition"] = { left: top, top: left, width: height, height: width }
	}

	const newParentName = parentNodeName === null ? node.name : parentNodeName + "." + node.name
	addNodeRecursively(names, node["children"], gameObjectPosition, newParentName, gameObjectPositions)
	return
}

function addWrappedFolderName(filePath) {
	const splitFilePath = filePath.split(".")
	return `${filePath.replace(/\./g, "/")}/${splitFilePath.slice(-1)}`
}

function createEdge(cycle) {
	return {
		fromNodeName: addWrappedFolderName(cycle.from),
		toNodeName: addWrappedFolderName(cycle.to),
		attributes: {
			coupling: 100.0
		}
	}
}

function createAttributeTypes() {
	return {
		edges: [
			{
				coupling: "relative"
			}
		]
	}
}

try {
	const data = fs.readFileSync("./gameObjectsAndCycles.json", "utf8")
	const { gameObjectPositions, cycles } = JSON.parse(data)

	const ccJson = {
		checksum: "somechecksum",
		data: {
			projectName: "ScriptProjectName",
			fileChecksum: "invalid-md5-sample",
			apiVersion: "1.3",
			nodes: []
		}
	}

	const nodes = []
	const edges = []

	for (const gameObjectPosition of gameObjectPositions) {
		const names = gameObjectPosition.name.split(".")
		addNodeRecursively(names, nodes, gameObjectPosition, null, gameObjectPositions)
	}

	// Actually we need to make sure if there are really edges in cc.json
	for (const cycle of cycles) {
		edges.push(createEdge(cycle))
	}

	ccJson.data.nodes = nodes
	ccJson.data["edges"] = edges
	ccJson.data["attributeTypes"] = createAttributeTypes()
	outputCCJsonFile(ccJson)
} catch (err) {
	console.log(`Error reading file from disk: ${err}`)
}
