// @ts-ignore
const fs = require("fs")

function isFile(name) {
	return name.includes(".")
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

	// create node
	let node = { name: name, type: isFile(name) ? "File" : "Folder", attributes: {} }
	if (!isFile(name)) node["children"] = []

	// add or select node
	if (!nodeAlreadyExists(nodes, name)) {
		nodes.push(node)
	} else {
		node = nodes.find(node => node["name"] == name)
	}

	// childScale.x / childScale.x  * 100 = height
	// childScale.z / childScale.z * 100 = width
	// childPosition.x / parentPosition.x * 100 = left
	// childPosition.z / parentPosition.z * 100 = top

	const parent = gameObjectPositions.find(gameObject => gameObject["name"] == parentNodeName)

	// set Position
	if (!isFile(name) && name !== "root") {
		let top
		let left
		let width
		let height
		if (parentNodeName === "root") {
			const cornerXofParent = 84.0 - 279.5 / 2
			const cornerZofParent = 168.0 - 559.0 / 2
			const cornerXofChild = gameObjectPosition.position.x - gameObjectPosition.scale.x / 2
			const cornerZofChild = gameObjectPosition.position.z - gameObjectPosition.scale.z / 2
			top = Math.ceil(((cornerXofChild - cornerXofParent) / 84.0) * 100)
			left = Math.ceil(((cornerZofChild - cornerZofParent) / 279.5) * 100)
			width = Math.ceil((gameObjectPosition.scale.x / 168.0) * 100)
			height = Math.ceil((gameObjectPosition.scale.z / 559.0) * 100)
		} else {
			const cornerXofParent = parent.position.x - parent.scale.x / 2
			const cornerZofParent = parent.position.z - parent.scale.z / 2
			const cornerXofChild = gameObjectPosition.position.x - gameObjectPosition.scale.x / 2
			const cornerZofChild = gameObjectPosition.position.z - gameObjectPosition.scale.z / 2
			top = Math.ceil(((cornerXofChild - cornerXofParent) / parent.scale.x) * 100)
			left = Math.ceil(((cornerZofChild - cornerZofParent) / parent.scale.z) * 100)
			width = Math.ceil((gameObjectPosition.scale.x / parent.scale.x) * 100)
			height = Math.ceil((gameObjectPosition.scale.z / parent.scale.z) * 100)
		}
		node["fixedPosition"] = { top, left, width, height }
	}
	if (isFile(name)) {
		node.attributes = { area: 2 }
	}

	const newParentName = parentNodeName === null ? node.name : parentNodeName + "/" + node.name
	addNodeRecursively(names, node["children"], gameObjectPosition, newParentName, gameObjectPositions)
	return
}

try {
	const data = fs.readFileSync("./gopos.json", "utf8")
	const { gameObjectPositions } = JSON.parse(data)

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

	for (const gameObjectPosition of gameObjectPositions) {
		const names = gameObjectPosition.name.split("/")
		// console.log(...nodes)
		// console.log("\n")
		addNodeRecursively(names, nodes, gameObjectPosition, null, gameObjectPositions)
	}

	ccJson["data"]["nodes"] = nodes
	outputCCJsonFile(ccJson)
} catch (err) {
	console.log(`Error reading file from disk: ${err}`)
}
