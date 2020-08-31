import { CodeMapNode, Fixed } from "../codeCharta.model"
import Ajv from "ajv"
import { ExportCCFile } from "../codeCharta.api.model"

const jsonSchema = require("./generatedSchema.json")
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

export const ERROR_MESSAGES = {
	fileIsInvalid: {
		title: "Error Loading File",
		message: "File is empty or invalid."
	},
	apiVersionIsInvalid: {
		title: "Error API Version",
		message: "API Version is empty or invalid."
	},
	majorApiVersionIsOutdated: {
		title: "Error Major API Version",
		message: "API Version Outdated: Update CodeCharta API Version to match cc.json."
	},
	minorApiVersionOutdated: {
		title: "Warning Minor API Version",
		message: "Minor API Version Outdated."
	},
	nodesNotUnique: {
		title: "Error Node Uniques",
		message: "Node names in combination with node types are not unique."
	},
	nodesEmpty: {
		title: "Error Nodes Empty",
		message: "The nodes-array must contain at least one valid node."
	},
	notAllFoldersAreFixed: {
		title: "Error All folders must be fixed",
		message: "If at least one direct sub-folder of root is marked as fixed, all direct sub-folders of root must be fixed."
	},
	fixedFoldersOutOfBounds: {
		title: "Error Fixed folders out of bounds",
		message: "Coordinates of fixed folders must be within a range of 0 and 100."
	},
	fixedFoldersOverlapped: {
		title: "Error Fixed folders overlapped",
		message: "Folders can't overlap."
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
		} else {
			if (file.nodes.length === 0) {
				result.error.push(ERROR_MESSAGES.nodesEmpty.message)
				result.title = ERROR_MESSAGES.nodesEmpty.title
			} else if (!hasUniqueChildren(file.nodes[0])) {
				result.error.push(ERROR_MESSAGES.nodesNotUnique.message)
				result.title = ERROR_MESSAGES.nodesNotUnique.title
			}
			validateFixedFolders(file, result)
		}
	}

	if (result.error.length > 0 || result.warning.length > 0) {
		throw result
	}
}

function getValidationMessage(error: Ajv.ErrorObject) {
	const errorType = error.keyword.charAt(0).toUpperCase() + error.keyword.slice(1)
	const errorParameter = error.dataPath.slice(1)
	return `${errorType} error: ${errorParameter} ${error.message}`
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

function validateFixedFolders(file: { apiVersion: string; nodes: CodeMapNode[] }, result: CCValidationResult) {
	if (file.nodes && file.nodes.length > 0 && file.nodes[0].children && file.nodes[0].children.length > 0) {
		return
	}

	const notFixed: string[] = []
	const outOfBounds: string[] = []
	const intersections: { node1: string; node2: string }[] = []

	file.nodes[0].children.forEach(node => {
		if (node.fixed === undefined) {
			notFixed.push(node.name)
		}

		if (isOutOfBounds(node)) {
			outOfBounds.push(node.name)
		}

		file.nodes[0].children.forEach(node2 => {
			if (node !== node2) {
				if (rectanglesIntersect(node.fixed, node2.fixed)) {
					intersections.push({ node1: node.name, node2: node2.name })
				}
			}
		})
	})

	if (notFixed.length > 0 && notFixed.length !== file.nodes[0].children.length) {
		result.title = ERROR_MESSAGES.notAllFoldersAreFixed.title
		result.error.push(`${ERROR_MESSAGES.notAllFoldersAreFixed.message} Found: ${notFixed.toString()}`)
	}

	if (outOfBounds.length > 0) {
		result.title = ERROR_MESSAGES.fixedFoldersOutOfBounds.title
		result.error.push(`${ERROR_MESSAGES.fixedFoldersOutOfBounds.message} Found: ${outOfBounds.toString()}`)
	}

	if (intersections.length > 0) {
		result.title = ERROR_MESSAGES.fixedFoldersOverlapped.title
		result.error.push(`${ERROR_MESSAGES.fixedFoldersOverlapped.message} Found: ${intersections.toString()}`)
	}
}

function rectanglesIntersect(node1: Fixed, node2: Fixed): boolean {
	return (
		!(node1.x >= node2.x + node2.width || node2.x >= node1.x + node1.width) ||
		!(node1.y >= node2.y + node2.height || node2.y >= node1.y + node1.height)
	)
}

function isOutOfBounds(node: CodeMapNode): boolean {
	const xBounds = node.fixed.x + node.fixed.width
	const yBounds = node.fixed.y + node.fixed.height
	return (
		node.fixed.x < 0 ||
		node.fixed.x > 100 ||
		node.fixed.y < 0 ||
		node.fixed.y > 100 ||
		xBounds < 0 ||
		xBounds > 100 ||
		yBounds < 0 ||
		yBounds > 100
	)
}
