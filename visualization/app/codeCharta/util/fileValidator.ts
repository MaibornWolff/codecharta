import { CodeMapNode } from "../codeCharta.model"
import { ValidationError, Validator, ValidatorResult } from "jsonschema"

const jsonSchema = require("./schema.json")
const latestApiVersion = require("../../../package.json").codecharta.apiVersion

interface ApiVersion {
	major: number
	minor: number
}

export interface CCValidationResult {
	error: string[]
	warning: string[]
	title: string
}

export class FileValidator {
	private static ERROR_MESSAGES = {
		fileIsInvalid: {
			title: "Error Loading File",
			message: "file is empty or invalid"
		},
		apiVersionIsInvalid: {
			title: "Error API Version",
			message: "API Version is empty or invalid"
		},
		majorApiVersionIsOutdated: {
			title: "Error Major API Version",
			message: "API Version Outdated: Update CodeCharta API Version to match cc.json"
		},
		minorApiVersionOutdated: {
			title: "Warning Minor API Version",
			message: "Minor API Version Outdated"
		},
		nodesNotUnique: {
			title: "Error Node Uniques",
			message: "node names in combination with node types are not unique"
		},
		validationError: {
			title: "Error Validation"
		}
	}

	public static validate(file: { apiVersion: string; nodes: CodeMapNode[] }): CCValidationResult {
		let result: CCValidationResult = { error: [], warning: [], title: "" }

		switch (true) {
			case !file:
				result.error.push(this.ERROR_MESSAGES.fileIsInvalid.message)
				result.title = this.ERROR_MESSAGES.fileIsInvalid.title
				break
			case !this.isValidApiVersion(file):
				result.error.push(this.ERROR_MESSAGES.apiVersionIsInvalid.message)
				result.title = this.ERROR_MESSAGES.apiVersionIsInvalid.title
				break
			case this.fileHasHigherMajorVersion(file):
				result.error.push(this.ERROR_MESSAGES.majorApiVersionIsOutdated.message)
				result.title = this.ERROR_MESSAGES.majorApiVersionIsOutdated.title
				break
			case this.fileHasHigherMinorVersion(file):
				result.warning.push(this.ERROR_MESSAGES.minorApiVersionOutdated.message)
				result.title = this.ERROR_MESSAGES.minorApiVersionOutdated.title
				break
		}

		if (result.error.length === 0) {
			let validator = new Validator()
			let validationResult: ValidatorResult = validator.validate(file, jsonSchema)

			if (validationResult.errors.length !== 0) {
				result.error = validationResult.errors.map((error: ValidationError) => this.getValidationMessage(error))
				result.title = this.ERROR_MESSAGES.validationError.title
			} else if (!FileValidator.hasUniqueChildren(file.nodes[0])) {
				result.error.push(this.ERROR_MESSAGES.nodesNotUnique.message)
				result.title = this.ERROR_MESSAGES.nodesNotUnique.title
			}
		}
		return result
	}

	private static getValidationMessage(error) {
		return "Parameter: " + error.property + " is not of type " + error.argument
	}

	private static hasUniqueChildren(node: CodeMapNode): boolean {
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

	private static isValidApiVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = file.apiVersion
		const hasApiVersion = apiVersion !== undefined
		const versionRegExp = new RegExp("[0-9]+\\.[0-9]+")
		const isValidVersion = versionRegExp.test(apiVersion)
		return hasApiVersion && isValidVersion
	}

	private static fileHasHigherMajorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = this.getAsApiVersion(file.apiVersion)
		return apiVersion.major > this.getAsApiVersion(latestApiVersion).major
	}

	private static fileHasHigherMinorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
		const apiVersion = this.getAsApiVersion(file.apiVersion)
		return apiVersion.minor > this.getAsApiVersion(latestApiVersion).minor
	}

	private static getAsApiVersion(version: string): ApiVersion {
		return {
			major: Number(version.split(".")[0]),
			minor: Number(version.split(".")[1])
		}
	}
}
