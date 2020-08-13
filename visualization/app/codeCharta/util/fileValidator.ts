import { CodeMapNode } from "../codeCharta.model"
import Ajv from "ajv"
import packageJson from "../../../package.json"
import { ExportCCFile } from "../codeCharta.api.model"
import _ from "lodash"
import jsonSchema from "./generatedSchema.json"

const latestApiVersion = packageJson.codecharta.apiVersion

interface ApiVersion {
	major: number
	minor: number
}

export interface CCValidationResult {
	error: string[]
	warning: string[]
	title: string
}

export const ERROR_MESSAGES = {
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

export function validate(file: ExportCCFile) {
	const result: CCValidationResult = { error: [], warning: [], title: "" }

	switch (true) {
		case !file:
			result.error.push(ERROR_MESSAGES.fileIsInvalid.message)
			result.title = ERROR_MESSAGES.fileIsInvalid.title
			break
		case !isValidApiVersion(file):
			result.error.push(ERROR_MESSAGES.apiVersionIsInvalid.message)
			result.title = ERROR_MESSAGES.apiVersionIsInvalid.title
			break
		case fileHasHigherMajorVersion(file):
			result.error.push(ERROR_MESSAGES.majorApiVersionIsOutdated.message)
			result.title = ERROR_MESSAGES.majorApiVersionIsOutdated.title
			break
		case fileHasHigherMinorVersion(file):
			result.warning.push(ERROR_MESSAGES.minorApiVersionOutdated.message)
			result.title = ERROR_MESSAGES.minorApiVersionOutdated.title
			break
	}

	if (result.error.length === 0) {
		const ajv = new Ajv({ allErrors: true })
		const validate = ajv.compile(jsonSchema)
		const valid = validate(file)

		if (!valid) {
			result.error = validate.errors.map((error: Ajv.ErrorObject) => getValidationMessage(error))
			result.title = ERROR_MESSAGES.validationError.title
		} else if (!hasUniqueChildren(file.nodes[0])) {
			result.error.push(ERROR_MESSAGES.nodesNotUnique.message)
			result.title = ERROR_MESSAGES.nodesNotUnique.title
		}
	}

	if (!_.isEmpty(result.error) || !_.isEmpty(result.warning)) {
		throw result
	}
}

function getValidationMessage(error: Ajv.ErrorObject) {
	const errorType = error.keyword.charAt(0).toUpperCase() + error.keyword.slice(1)
	const errorParameter = error.dataPath.slice(1)
	return errorType + " error: " + errorParameter + " " + error.message
}

function hasUniqueChildren(node: CodeMapNode): boolean {
	if (!node.children || node.children.length === 0) {
		return true
	}

	const names = {}
	node.children.forEach(child => (names[child.name + child.type] = true))

	if (Object.keys(names).length !== node.children.length) {
		return false
	}

	for (const child of node.children) {
		if (!hasUniqueChildren(child)) {
			return false
		}
	}
	return true
}

function isValidApiVersion(file: ExportCCFile): boolean {
	const apiVersion = file.apiVersion
	const hasApiVersion = apiVersion !== undefined
	const versionRegExp = new RegExp("[0-9]+\\.[0-9]+")
	const isValidVersion = versionRegExp.test(apiVersion)
	return hasApiVersion && isValidVersion
}

function fileHasHigherMajorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
	const apiVersion = getAsApiVersion(file.apiVersion)
	return apiVersion.major > getAsApiVersion(latestApiVersion).major
}

function fileHasHigherMinorVersion(file: { apiVersion: string; nodes: CodeMapNode[] }): boolean {
	const apiVersion = getAsApiVersion(file.apiVersion)
	return apiVersion.minor > getAsApiVersion(latestApiVersion).minor
}

function getAsApiVersion(version: string): ApiVersion {
	return {
		major: Number(version.split(".")[0]),
		minor: Number(version.split(".")[1])
	}
}
