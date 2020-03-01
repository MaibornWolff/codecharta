import { CodeMapNode } from "../codeCharta.model"
import { ErrorObject } from "ajv"

function hasUniqueChildren(node: CodeMapNode) {
	if (!node.children || node.children.length === 0) {
		return true
	}

	let names = {}
	for (let child of node.children) {
		names[child.name + child.type] = true
	}
	if (Object.keys(names).length !== node.children.length) {
		return false
	}

	for (let child of node.children) {
		if (!hasUniqueChildren(child)) {
			return false
		}
	}
	return true
}

export function validate(file: { nodes: CodeMapNode[] }): Array<{ message: string; dataPath: string }> | ErrorObject[] {
	if (!file) {
		return [{ message: "file is empty or invalid", dataPath: "empty or invalid file" }]
	}
	let ajv = require("ajv")()
	let compare = ajv.compile(require("./generatedSchema.json"))
	let isValid = compare(file)

	if (!hasUniqueChildren(file.nodes[0])) {
		return [
			{
				message: "node names with node types are not unique",
				dataPath: "uniqueness"
			}
		]
	}

	return isValid ? [] : compare.errors
}
