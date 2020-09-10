import { CodeMapNode, FixedPosition } from "../codeCharta.model"
import Ajv from "ajv"
import packageJson from "../../../package.json"
import { ExportCCFile } from "../codeCharta.api.model"
import jsonSchema from "./generatedSchema.json"

const latestApiVersion = packageJson.codecharta.apiVersion

interface ApiVersion {
	major: number
	minor: number
}

export interface CCValidationResult {
	error: string[]
	warning: string[]
}

export const ERROR_MESSAGES = {
	fileIsInvalid: "File is empty or invalid.",
	apiVersionIsInvalid: "API Version is empty or invalid.",
	majorApiVersionIsOutdated: "API Version Outdated: Update CodeCharta API Version to match cc.json.",
	minorApiVersionOutdated: "Minor API Version Outdated.",
	nodesNotUnique: "Node names in combination with node types are not unique.",
	nodesEmpty: "The nodes array is empty. At least one node is required.",
	notAllFoldersAreFixed: "If at least one direct sub-folder of root is marked as fixed, all direct sub-folders of root must be fixed.",
	fixedFoldersOutOfBounds: "Coordinates of fixed folders must be within a range of 0 and 100.",
	fixedFoldersOverlapped: "Folders may not overlap.",
	fixedFoldersNotAllowed: "Fixated folders may not be defined in API-Version < 1.2."
}

export function validate(file: ExportCCFile) {
	const result: CCValidationResult = { error: [], warning: [] }

	switch (true) {
		case !file:
			result.error.push(ERROR_MESSAGES.fileIsInvalid)
			break
		case !isValidApiVersion(file):
			result.error.push(ERROR_MESSAGES.apiVersionIsInvalid)
			break
		case fileHasHigherMajorVersion(file):
			result.error.push(ERROR_MESSAGES.majorApiVersionIsOutdated)
			break
		case fileHasHigherMinorVersion(file):
			result.warning.push(`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${file.apiVersion}`)
	}

	if (result.error.length === 0) {
		const ajv = new Ajv({ allErrors: true })
		const validate = ajv.compile(jsonSchema)
		const valid = validate(file)

		if (!valid) {
			result.error = validate.errors.map((error: Ajv.ErrorObject) => getValidationMessage(error))
		} else if (file.nodes.length === 0) {
			result.error.push(ERROR_MESSAGES.nodesEmpty)
		} else {
			validateAllNodesAreUnique(file.nodes[0], result)
			validateFixedFolders(file, result)
		}
	}

	if (result.error.length > 0 || result.warning.length > 0) {
		throw result
	}
}

function isValidApiVersion(file: ExportCCFile): boolean {
	const apiVersion = file.apiVersion
	const hasApiVersion = apiVersion !== undefined
	const versionRegExp = new RegExp("[0-9]+\\.[0-9]+")
	const isValidVersion = versionRegExp.test(apiVersion)
	return hasApiVersion && isValidVersion
}

function fileHasHigherMajorVersion(file: ExportCCFile): boolean {
	const apiVersion = getAsApiVersion(file.apiVersion)
	return apiVersion.major > getAsApiVersion(latestApiVersion).major
}

function fileHasHigherMinorVersion(file: ExportCCFile): boolean {
	const apiVersion = getAsApiVersion(file.apiVersion)
	return apiVersion.minor > getAsApiVersion(latestApiVersion).minor
}

function getAsApiVersion(version: string): ApiVersion {
	return {
		major: Number(version.split(".")[0]),
		minor: Number(version.split(".")[1])
	}
}

function getValidationMessage(error: Ajv.ErrorObject) {
	const errorType = error.keyword.charAt(0).toUpperCase() + error.keyword.slice(1)
	const errorParameter = error.dataPath.slice(1)
	return `${errorType} error: ${errorParameter} ${error.message}`
}

function validateAllNodesAreUnique(node: CodeMapNode, result: CCValidationResult) {
	const names = new Set<string>()
	names.add(`${node.name}|${node.type}`)
	validateChildrenAreUniqueRecursive(node, result, names)
}

function validateChildrenAreUniqueRecursive(node: CodeMapNode, result: CCValidationResult, names: Set<string>) {
	if (!node.children || node.children.length === 0) {
		return
	}

	for (const child of node.children) {
		if (names.has(`${child.name}|${child.type}`)) {
			result.error.push(`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of ${child.type} with name: ${child.name}`)
		} else {
			names.add(`${child.name}|${child.type}`)
			validateChildrenAreUniqueRecursive(child, result, names)
		}
	}
}

function validateFixedFolders(file: ExportCCFile, result: CCValidationResult) {
	const notFixed: string[] = []
	const outOfBounds: string[] = []
	const intersections: Set<string> = new Set()

	for (const node of file.nodes[0].children) {
		if (node.fixedPosition === undefined) {
			notFixed.push(`${node.name}`)
		} else {
			const apiVersion = getAsApiVersion(file.apiVersion)
			if (apiVersion.major < 1 || (apiVersion.major === 1 && apiVersion.minor < 2)) {
				result.error.push(`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: ${file.apiVersion}`)
				return
			}

			if (isOutOfBounds(node)) {
				outOfBounds.push(getFoundFolderMessage(node))
			}

			for (const node2 of file.nodes[0].children) {
				if (
					node2.fixedPosition !== undefined &&
					node !== node2 &&
					rectanglesIntersect(node.fixedPosition, node2.fixedPosition) &&
					!intersections.has(`${getFoundFolderMessage(node2)} and ${getFoundFolderMessage(node)}`)
				) {
					intersections.add(`${getFoundFolderMessage(node)} and ${getFoundFolderMessage(node2)}`)
				}
			}
		}
	}

	if (notFixed.length > 0 && notFixed.length !== file.nodes[0].children.length) {
		result.error.push(`${ERROR_MESSAGES.notAllFoldersAreFixed} Found: ${notFixed.join(", ")}`)
	}

	if (outOfBounds.length > 0) {
		result.error.push(`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: ${outOfBounds.join(", ")}`)
	}

	if (intersections.size > 0) {
		result.error.push(`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: ${[...intersections].join(", ")}`)
	}
}

function getFoundFolderMessage(node: CodeMapNode): string {
	return `${node.name} ${JSON.stringify(node.fixedPosition)}`
}

function rectanglesIntersect(rect1: FixedPosition, rect2: FixedPosition): boolean {
	return (
		isInRectangle(rect1.left, rect1.top, rect2) ||
		isInRectangle(rect1.left, rect1.top + rect1.height, rect2) ||
		isInRectangle(rect1.left + rect1.width, rect1.top, rect2) ||
		isInRectangle(rect1.left + rect1.width, rect1.top + rect1.height, rect2)
	)
}

function isInRectangle(x: number, y: number, rect: FixedPosition): boolean {
	return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height
}

function isOutOfBounds({ fixedPosition: { left, top, width, height } }: CodeMapNode): boolean {
	return left < 0 || top < 0 || left + width > 100 || top + height > 100 || width < 0 || height < 0
}
