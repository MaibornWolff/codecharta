import { CodeMapNode } from "../codeCharta.model"

export class FileValidator {
	private static hasUniqueChildren(node: CodeMapNode) {
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
			if (!FileValidator.hasUniqueChildren(child)) {
				return false
			}
		}
		return true
	}

	public static validate(file: { nodes: CodeMapNode[] }): Array<{ message: string; dataPath: string }> {
		if (!file) {
			return [{ message: "file is empty or invalid", dataPath: "empty or invalid file" }]
		}
		let ajv = require("ajv")()
		let compare = ajv.compile(require("./schema.json"))
		let valid = compare(file)

		if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
			return [
				{
					message: "names or ids are not unique",
					dataPath: "uniqueness"
				}
			]
		}

		return valid ? [] : compare.errors
	}
}
