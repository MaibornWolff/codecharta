import { CodeMapNode, FixedPosition } from "../../../../codeCharta.model"
import Ajv, { ErrorObject } from "ajv"
import packageJson from "../../../../../../package.json"
import { ExportCCFile } from "../../../../codeCharta.api.model"
import { CcJson2, FileNode } from "../../../../model/ccjson2.model"
import jsonSchema from "../../../../util/generatedSchema.json"
import ccJson2Schema from "../../../../util/ccJson2Schema.json"
import { isLeaf } from "../../../../util/codeMapHelper"

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
    nodeIdsNotUnique: "Node ids are not unique.",
    nodesEmpty: "The nodes array is empty. At least one node is required.",
    notAllFoldersAreFixed: "If at least one direct sub-folder of root is marked as fixed, all direct sub-folders of root must be fixed.",
    fixedFoldersOutOfBounds: "Coordinates of fixed folders must be within a range of 0 and 100.",
    fixedFoldersOverlapped: "Folders may not overlap.",
    fixedFoldersNotAllowed: "Fixated folders may not be defined in API-Version < 1.2.",
    fileAlreadyExists: "File already exists.",
    blacklistError: "Excluding all buildings is not possible.",
    fileContainsAuthorsAttribute:
        "File contains unsupported 'authors' attribute. This attribute will be ignored. Node containing the attribute: "
}

/** The raw parsed file content at the load boundary — a 1.x export, a 2.0 file, or nothing. */
export type CcFileContent = ExportCCFile | CcJson2 | null | undefined

/**
 * A cc.json 2.0 file is identified by its `{ meta, files, lenses }` envelope, not by a bare major
 * number — a legacy `{ apiVersion: "2.0", nodes }` file (no `meta`) must still travel the 1.x path.
 * A type guard, so every caller narrows `CcFileContent` without casting.
 */
export function isCcJson2(content: CcFileContent): content is CcJson2 {
    if (content == null || typeof content !== "object" || !("meta" in content)) {
        return false
    }
    return typeof content.meta.apiVersion === "string" && getAsApiVersion(content.meta.apiVersion).major === 2
}

export function detectApiVersionMajor(content: CcFileContent): number {
    if (isCcJson2(content)) {
        return getAsApiVersion(content.meta.apiVersion).major
    }
    if (content != null && typeof content.apiVersion === "string") {
        return getAsApiVersion(content.apiVersion).major
    }
    return Number.NaN
}

export function removeAuthorsAttributes(file: CcFileContent): string[] {
    // 2.0 authors are regular metric attributes (out of scope); nothing to strip for 2.0/empty files.
    if (isCcJson2(file) || file == null || !file.nodes) {
        return []
    }
    return removeAuthorsAttributeFromNodes(file.nodes)
}

export function checkWarnings(file: CcFileContent): string[] {
    if (file == null || isCcJson2(file)) {
        return []
    }
    if (fileHasHigherMinorVersion(file)) {
        return [`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${file.apiVersion}`]
    }
    return []
}

export function checkErrors(file: CcFileContent): string[] {
    if (isCcJson2(file)) {
        return checkErrors2_0(file)
    }
    if (file == null) {
        return [ERROR_MESSAGES.fileIsInvalid]
    }
    const errors: string[] = []
    switch (true) {
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

function checkErrors2_0(file: CcJson2): string[] {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(ccJson2Schema)
    if (!validate(file)) {
        return validate.errors.map((error: ErrorObject) => getValidationMessage(error))
    }
    return validateAllFileNodeIdsAreUnique(file.files[0])
}

function validateAllFileNodeIdsAreUnique(root: FileNode): string[] {
    const errors: string[] = []
    collectDuplicateFileNodeIds(root, new Set<string>(), errors)
    return errors
}

function collectDuplicateFileNodeIds(node: FileNode, seenIds: Set<string>, errors: string[]) {
    if (seenIds.has(node.id)) {
        errors.push(`${ERROR_MESSAGES.nodeIdsNotUnique} Found duplicate id: ${node.id}`)
    } else {
        seenIds.add(node.id)
    }
    for (const child of node.children ?? []) {
        collectDuplicateFileNodeIds(child, seenIds, errors)
    }
}

function checkJsonSchema(file: ExportCCFile) {
    const errors: string[] = []
    if (errors.length === 0) {
        const ajv = new Ajv({ allErrors: true, strict: false })
        const validate = ajv.compile(jsonSchema)
        const valid = validate(file)

        if (!valid) {
            errors.push(...validate.errors.map((error: ErrorObject) => getValidationMessage(error)))
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

function removeAuthorsAttributeFromNodes(nodes: CodeMapNode[]): string[] {
    const warnings: string[] = []
    for (const node of nodes) {
        if (node.attributes?.authors) {
            delete node.attributes.authors
            warnings.push(`${ERROR_MESSAGES.fileContainsAuthorsAttribute}"${node.name}"`)
        }

        if (node.children) {
            warnings.push(...removeAuthorsAttributeFromNodes(node.children))
        }
    }
    return warnings
}

export function getAsApiVersion(version: string): ApiVersion {
    return {
        major: Number(version.split(".")[0]),
        minor: Number(version.split(".")[1])
    }
}

function getValidationMessage(error: ErrorObject) {
    const errorType = error.keyword.charAt(0).toUpperCase() + error.keyword.slice(1)
    const errorParameter = error.instancePath.slice(1)
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
