import { CodeMapNode, FixedPosition } from "../codeCharta.model"
import Ajv from "ajv"
import packageJson from "../../../package.json"
import { ExportCCFile } from "../codeCharta.api.model"
import jsonSchema from "./generatedSchema.json"
import { isLeaf } from "./codeMapHelper"

const latestApiVersion = packageJson.codecharta.apiVersion

interface ApiVersion {
    major: number
    minor: number
}

export interface CCFileValidationResult {
    fileName: string
    errors: string[]
    warnings: string[]
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
    fixedFoldersNotAllowed: "Fixated folders may not be defined in API-Version < 1.2.",
    fileAlreadyExists: "File already exists.",
    blacklistError: "Excluding all buildings is not possible."
}

export function checkWarnings(file: ExportCCFile) {
    const warnings: string[] = []
    if (!file) {
        return warnings
    }
    if (fileHasHigherMinorVersion(file)) {
        warnings.push(`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${file.apiVersion}`)
    }
    return warnings
}

export function checkErrors(file: ExportCCFile) {
    const errors: string[] = []
    switch (true) {
        case !file:
            errors.push(ERROR_MESSAGES.fileIsInvalid)
            break
        case !isValidApiVersion(file):
            errors.push(ERROR_MESSAGES.apiVersionIsInvalid)
            break
        case fileHasHigherMajorVersion(file):
            errors.push(ERROR_MESSAGES.majorApiVersionIsOutdated)
            break
    }
    if (errors.length === 0) {
        errors.push(...checkJsonSchema(file))
    }
    return errors
}

function checkJsonSchema(file: ExportCCFile) {
    const errors: string[] = []
    if (errors.length === 0) {
        const ajv = new Ajv({ allErrors: true })
        const validate = ajv.compile(jsonSchema)
        const valid = validate(file)

        if (!valid) {
            errors.push(...validate.errors.map((error: Ajv.ErrorObject) => getValidationMessage(error)))
        } else if (file.nodes.length === 0) {
            errors.push(ERROR_MESSAGES.nodesEmpty)
        } else {
            errors.push(...validateAllNodesAreUnique(file.nodes[0]), ...validateFixedFolders(file))
        }
    }
    return errors
}

function isValidApiVersion(file: ExportCCFile) {
    const { apiVersion } = file
    const hasApiVersion = apiVersion !== undefined
    const versionRegExp = /\d+\.\d+/
    const isValidVersion = versionRegExp.test(apiVersion)
    return hasApiVersion && isValidVersion
}

function fileHasHigherMajorVersion(file: ExportCCFile) {
    const apiVersion = getAsApiVersion(file.apiVersion)
    return apiVersion.major > getAsApiVersion(latestApiVersion).major
}

function fileHasHigherMinorVersion(file: ExportCCFile) {
    const apiVersion = getAsApiVersion(file.apiVersion)
    return apiVersion.minor > getAsApiVersion(latestApiVersion).minor
}

export function getAsApiVersion(version: string): ApiVersion {
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

function validateAllNodesAreUnique(node: CodeMapNode) {
    const errors: string[] = []
    const names = new Set<string>()
    names.add(`${node.name}|${node.type}`)
    validateChildrenAreUniqueRecursive(node, errors, names, `/${node.name}`)
    return errors
}

function validateChildrenAreUniqueRecursive(node: CodeMapNode, errors: string[], names: Set<string>, subPath: string) {
    if (isLeaf(node)) {
        return
    }

    for (const child of node.children) {
        const path = `${subPath}/${child.name}`
        if (names.has(`${path}|${child.type}`)) {
            errors.push(`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of ${child.type} with path: ${path}`)
        } else {
            names.add(`${path}|${child.type}`)
            validateChildrenAreUniqueRecursive(child, errors, names, path)
        }
    }
}

function checkChildNodes(
    childNodes: CodeMapNode[],
    notFixed: string[],
    file: ExportCCFile,
    errors: string[],
    outOfBounds: string[],
    intersections: Set<string>
) {
    for (const node of childNodes) {
        if (node.fixedPosition === undefined) {
            notFixed.push(`${node.name}`)
        } else {
            const apiVersion = getAsApiVersion(file.apiVersion)
            if (apiVersion.major < 1 || (apiVersion.major === 1 && apiVersion.minor < 2)) {
                errors.push(`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: ${file.apiVersion}`)
                return
            }

            if (isOutOfBounds(node)) {
                outOfBounds.push(getFoundFolderMessage(node))
            }

            for (const node2 of childNodes) {
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
}

function validateFixedFolders(file: ExportCCFile, childNodes: CodeMapNode[] = file.nodes[0].children) {
    const errors: string[] = []
    const notFixed: string[] = []
    const outOfBounds: string[] = []
    const intersections: Set<string> = new Set()

    checkChildNodes(childNodes, notFixed, file, errors, outOfBounds, intersections)

    if (notFixed.length > 0 && notFixed.length !== childNodes.length) {
        errors.push(`${ERROR_MESSAGES.notAllFoldersAreFixed} Found: ${notFixed.join(", ")}`)
    }

    if (outOfBounds.length > 0) {
        errors.push(`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: ${outOfBounds.join(", ")}`)
    }

    if (intersections.size > 0) {
        errors.push(`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: ${[...intersections].join(", ")}`)
    }

    for (const node of childNodes) {
        if (node.children) {
            errors.push(...validateFixedFolders(file, node.children))
        }
    }
    return errors
}

function getFoundFolderMessage(node: CodeMapNode) {
    return `${node.name} ${JSON.stringify(node.fixedPosition)}`
}

function rectanglesIntersect(rect1: FixedPosition, rect2: FixedPosition) {
    return (
        isInRectangle(rect1.left, rect1.top, rect2) ||
        isInRectangle(rect1.left, rect1.top + rect1.height, rect2) ||
        isInRectangle(rect1.left + rect1.width, rect1.top, rect2) ||
        isInRectangle(rect1.left + rect1.width, rect1.top + rect1.height, rect2)
    )
}

function isInRectangle(x: number, y: number, rect: FixedPosition) {
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height
}

function isOutOfBounds({ fixedPosition: { left, top, width, height } }: CodeMapNode) {
    return left < 0 || top < 0 || left + width > 100 || top + height > 100 || width < 0 || height < 0
}
