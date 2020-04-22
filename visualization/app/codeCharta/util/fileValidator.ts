import { CodeMapNode } from "../codeCharta.model"
import { DialogService } from "../ui/dialog/dialog.service"
import { Validator } from "jsonschema"

const jsonSchema = require("./schema.json")
const latestApiVersion = require("../../../package.json").codecharta.apiVersion

export class FileValidator {
	public static validate(file: { nodes: CodeMapNode[] }, dialogService?: DialogService): string[] {
		let minorApiWrongMessage = ""

		if (!file) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " file is empty or invalid"]
		}

		let validator = new Validator()
		let validationResult = validator.validate(file, jsonSchema)

		if (!this.isValidApiVersion(file)) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " file API Version is empty or invalid"]
		}

		if (this.fileHasHigherMajorVersion(file)) {
			return ['<i class="fa fa-exclamation-circle"></i>' + " API Version Outdated: Update CodeCharta API Version to match cc.json"]
		} else if (this.fileHasHigherMinorVersion(file)) {
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
					"Parameter: " +
					validationResult.errors[i].property +
					" is not of type " +
					validationResult.errors[i].argument
				message[i] = errorMessageBuilder
			}
			message[validationResult.errors.length] = minorApiWrongMessage
			return message
		}

		if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
			return ['<i class="fa fa-exclamation-circle"></i>' + "names or ids are not unique"]
		}

		if (minorApiWrongMessage !== "") {
			dialogService.showErrorDialog(minorApiWrongMessage, "Warning")
		}

		return null
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

	private static getFileApiVersion(file: { nodes: CodeMapNode[] }) {
		for (let key in file) {
			if (key === "apiVersion") {
				return file[key]
			}
		}
	}

	private static isValidApiVersion(file: { nodes: CodeMapNode[] }): boolean {
		const apiVersion = this.getFileApiVersion(file)
		const hasApiVersion = apiVersion !== undefined
		const versionRegExp = new RegExp("[0-9]+.[0-9]+")
		const isValidVersion = versionRegExp.test(apiVersion)
		return hasApiVersion && isValidVersion
	}

	private static fileHasHigherMajorVersion(file: { nodes: CodeMapNode[] }): boolean {
		const apiVersion = FileValidator.getFileApiVersion(file)
		let fileMajorVersion = this.getMajorVersion(apiVersion)
		let latestMajorVersion = this.getMajorVersion(latestApiVersion)

		return fileMajorVersion > latestMajorVersion
	}

	private static fileHasHigherMinorVersion(file: { nodes: CodeMapNode[] }): boolean {
		const apiVersion = FileValidator.getFileApiVersion(file)
		let fileMinorVersion = this.getMinorVersion(apiVersion)
		let latestMinorVersion = this.getMinorVersion(latestApiVersion)

		return fileMinorVersion > latestMinorVersion
	}

	private static getMajorVersion(version: string) {
		return version.split(".")[0]
	}

	private static getMinorVersion(version: string) {
		return version.split(".")[1]
	}
}
