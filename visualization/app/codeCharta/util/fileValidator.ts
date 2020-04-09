import { CodeMapNode } from "../codeCharta.model"
import * as codeCharta from "../../../package.json"

export class FileValidator {
	public static validate(file: { nodes: CodeMapNode[] }): Array<{ message: string; dataPath: string }> {
		if (!file) {
			return [{ message: "file is empty or invalid", dataPath: "empty or invalid file" }]
		}

		let Validator = require("jsonschema").Validator
		let valid = new Validator()
		let validationResult = valid.validate(file, require("./schema.json"))
		console.log(validationResult.errors)

		this.checkApiVersion(file)

		if (validationResult.errors.length !== 0) {
			return [
				{
					message: validationResult.errors,
					dataPath: ""
				}
			]
		}
		if (validationResult.valid) {
			if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
				return [
					{
						message: "names or ids are not unique",
						dataPath: "uniqueness"
					}
				]
			}
		}

		return validationResult.errors
	}

	private static hasUniqueChildren(node: CodeMapNode) {
		if (!node.children || node.children.length === 0) {
			return true
		}

		let names = {}
		node.children.forEach(child => (names[child.name + child.type] = true))

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

	private static checkApiVersion(file: { nodes: CodeMapNode[] }) {
		let apiVersion = this.getCodeChartaApiVersion()
		let fileApiVersion = this.getFileApiVersion(file)

		let apiVersionMajor = apiVersion.split(".")[0]
		let apiVersionMinor = apiVersion.split(".")[1]

		let majorVersion = fileApiVersion.split(".")[0]
		let minorVersion = fileApiVersion.split(".")[1]

		if (majorVersion > apiVersionMajor) {
			console.log("Major Version Wrong")
			return
		}
		if (minorVersion > apiVersionMinor) {
			console.log("Minor Version Wrong")
			return
		}
	}

	private static getCodeChartaApiVersion() {
		let schemaCodeCharta = codeCharta
		let schemaApiVersion

		for (let key in schemaCodeCharta) {
			if (key === "codecharta") {
				schemaApiVersion = schemaCodeCharta[key]
				for (let apiVersionKey in schemaApiVersion) {
					return schemaApiVersion[apiVersionKey]
				}
			}
		}
	}

	private static getFileApiVersion(file: { nodes: CodeMapNode[] }) {
		for (let key in file) {
			if (key === "apiVersion") {
				return file[key]
			}
		}
	}
}
