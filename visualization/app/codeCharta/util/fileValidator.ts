import { CodeMapNode, RecursivePartial } from "../codeCharta.model"
import { ErrorObject } from "ajv"
import { ExportCCFile } from "../codeCharta.api.model"

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

export function validate(file: RecursivePartial<ExportCCFile>): ErrorObject[] {
	if (!file) {
		return getErrorObject("root", { emptyFile: "n/a" }, "file should not be empty or invalid")
	}
	let ajv = require("ajv")()
	let compare = ajv.compile(require("./generatedSchema.json"))
	let isValid = compare(file)

	if (!isValid) {
		return compare.errors
	}

	if (!hasUniqueChildren(file.nodes[0])) {
		return getErrorObject("n/a", { uniqueness: "n/a" }, "node children should be unique by name and nodeType")
	}
	return []
}

export function validateApiVersion(file: RecursivePartial<ExportCCFile>): ErrorObject[] {
	const errorObject = getErrorObject("root", { missingProperty: "apiVersion" }, "file should contain property 'apiVersion'")
	return !file || !file.apiVersion ? errorObject : []
}

function getErrorObject(dataPath: string, params: { [key: string]: string }, message: string): ErrorObject[] {
	return [{ keyword: "n/a", dataPath, schemaPath: "n/a", params, message }]
}
