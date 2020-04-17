import { CodeMapNode } from "../codeCharta.model"
import * as codeCharta from "../../../package.json"
import { DialogService } from "../ui/dialog/dialog.service"

export class FileValidator {
	public static validate(file: { nodes: CodeMapNode[] }, dialogService?: DialogService): string[] {
		let minorApiWrongMessage = ""

		if (!file) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " file is empty or invalid"]
		}

		let Validator = require("jsonschema").Validator
		let valid = new Validator()
		let validationResult = valid.validate(file, require("./schema.json"))

		if (this.checkApiVersion(file)[0]) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " API Version Outdated: Update API Version to match cc.json"]
		} else if (this.checkApiVersion(file)[1]) {
			if (dialogService !== undefined) {
				minorApiWrongMessage = '<i class="fa fa-exclamation-triangle"></i>' + " Minor API Version Wrong"
			}
		}

		if (validationResult.errors.length !== 0) {
			let message: string[] = new Array(validationResult.errors.length + 1)
			for (let i = 0; i < validationResult.errors.length; i++) {
				let errorMessageBuilder = ""
				errorMessageBuilder =
					'<i class="fa fa-exclamation-circle"></i>' +
					"Parameter " +
					validationResult.errors[i].property +
					" is not of type " +
					validationResult.errors[i].argument
				message[i] = errorMessageBuilder
			}
			message[validationResult.errors.length] = minorApiWrongMessage
			return message
		}

		if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " names or ids are not unique"]
		}

		if (minorApiWrongMessage !== "") {
			dialogService.showErrorDialog(minorApiWrongMessage, "Warning")
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

		let apiVersionMajorMinor = [false, false]

		let apiVersionMajor = apiVersion.split(".")[0]
		let apiVersionMinor = apiVersion.split(".")[1]

		let majorVersion = fileApiVersion.split(".")[0]
		let minorVersion = fileApiVersion.split(".")[1]

		if (majorVersion > apiVersionMajor) {
			apiVersionMajorMinor[0] = true
		} else if (minorVersion > apiVersionMinor) {
			apiVersionMajorMinor[1] = true
		}
		return apiVersionMajorMinor
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
