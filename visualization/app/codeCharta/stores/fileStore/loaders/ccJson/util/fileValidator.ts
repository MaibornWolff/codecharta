import Ajv, { ErrorObject } from "ajv"
import packageJson from "../../../../../../../package.json"
import { CcJson2, FileNode } from "../../../../../model/ccjson2.model"
import { ExportCCFile } from "../../../../../model/codeCharta.api.model"
import { CodeMapNode } from "../../../../../model/codeCharta.model"
import ccJson2Schema from "../../../../../util/ccJson2Schema.json"
import { isLeaf } from "../../../../../util/codeMapHelper"
import jsonSchema from "../../../../../util/generatedSchema.json"
import { getAsApiVersion } from "./apiVersion"
import { ERROR_MESSAGES } from "./fileValidationMessages"
import { validateFixedFolders } from "./fixedFolderValidator"

const latestApiVersion = packageJson.codecharta.apiVersion

export interface CCFileValidationResult {
    fileName: string
    errors: string[]
    warnings: string[]
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

export function removeAuthorsAttributes(file: CcFileContent): string[] {
    if (isCcJson2(file) || !file?.nodes) {
        return []
    }
    return removeAuthorsAttributeFromNodes(file.nodes)
}

export function checkWarnings(file: CcFileContent): string[] {
    if (file == null) {
        return []
    }
    if (isCcJson2(file)) {
        return collectUnresolvedNodeIdWarnings(file)
    }
    if (fileHasHigherMinorVersion(file)) {
        return [`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${file.apiVersion}`]
    }
    return []
}

/**
 * cc.json 2.0 dependency edges and domain-lens word banks reference nodes by id; the 2.0 reader silently
 * drops any of them whose id is absent from the file tree (mapEdges, mapDomainWords). Surface each drop as
 * a load warning so it shows in the load-warnings dialog instead of only console.warn.
 */
function collectUnresolvedNodeIdWarnings(file: CcJson2): string[] {
    const root = file.files?.[0]
    if (root === undefined) {
        return []
    }
    const nodeIds = new Set<string>()
    collectFileNodeIds(root, nodeIds)
    return [...collectUnresolvedEdgeWarnings(file, nodeIds), ...collectUnresolvedDomainWordsWarnings(file, nodeIds)]
}

function collectUnresolvedEdgeWarnings(file: CcJson2, nodeIds: Set<string>): string[] {
    const warnings: string[] = []
    for (const edge of file.lenses.dependency?.edges ?? []) {
        if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) {
            warnings.push(`${ERROR_MESSAGES.unresolvedEdgeEndpoint} ${edge.fromId} -> ${edge.toId}`)
        }
    }
    return warnings
}

function collectUnresolvedDomainWordsWarnings(file: CcJson2, nodeIds: Set<string>): string[] {
    const warnings: string[] = []
    for (const nodeId of Object.keys(file.lenses.domain?.nodes ?? {})) {
        if (!nodeIds.has(nodeId)) {
            warnings.push(`${ERROR_MESSAGES.unresolvedDomainWordsNodeId} ${nodeId}`)
        }
    }
    return warnings
}

function collectFileNodeIds(node: FileNode, into: Set<string>) {
    into.add(node.id)
    for (const child of node.children ?? []) {
        collectFileNodeIds(child, into)
    }
}

export function checkErrors(file: CcFileContent): string[] {
    const errors = checkContentErrors(file)
    return errors.length === 0 && !hasChecksum(file) ? [ERROR_MESSAGES.checksumUnavailable] : errors
}

function hasChecksum(file: ExportCCFile | CcJson2): boolean {
    return Boolean(isCcJson2(file) ? file.meta.checksum : file.fileChecksum)
}

function checkContentErrors(file: CcFileContent): string[] {
    if (isCcJson2(file)) {
        return checkErrors2_0(file)
    }
    if (file == null) {
        return [ERROR_MESSAGES.fileIsInvalid]
    }
    if (!isValidApiVersion(file)) {
        return [ERROR_MESSAGES.apiVersionIsInvalid]
    }
    if (fileHasHigherMajorVersion(file)) {
        return [ERROR_MESSAGES.majorApiVersionIsOutdated]
    }
    return checkJsonSchema(file)
}

function checkErrors2_0(file: CcJson2): string[] {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(ccJson2Schema)
    if (!validate(file)) {
        return validate.errors.map((error: ErrorObject) => getValidationMessage(error))
    }
    return [...validateAllFileNodeIdsAreUnique(file.files[0]), ...validateAllFileNodesAreUnique(file.files[0])]
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

/**
 * A 2.0 node id already encodes type + tree position, but the file may come from a producer that did not
 * enforce it; check sibling name|type uniqueness directly (mirrors the 1.x validateAllNodesAreUnique
 * check) so two same-name-same-type siblings are rejected instead of trusted.
 */
function validateAllFileNodesAreUnique(root: FileNode): string[] {
    const errors: string[] = []
    collectDuplicateSiblingFileNodes(root, `/${root.name}`, errors)
    return errors
}

function collectDuplicateSiblingFileNodes(node: FileNode, subPath: string, errors: string[]) {
    const seen = new Set<string>()
    for (const child of node.children ?? []) {
        const path = `${subPath}/${child.name}`
        const key = `${child.name}|${child.type}`
        if (seen.has(key)) {
            errors.push(`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of ${child.type} with path: ${path}`)
        } else {
            seen.add(key)
            collectDuplicateSiblingFileNodes(child, path, errors)
        }
    }
}

function checkJsonSchema(file: ExportCCFile): string[] {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(jsonSchema)
    if (!validate(file)) {
        return validate.errors.map((error: ErrorObject) => getValidationMessage(error))
    }
    if (file.nodes.length === 0) {
        return [ERROR_MESSAGES.nodesEmpty]
    }
    return [...validateAllNodesAreUnique(file.nodes[0]), ...validateFixedFolders(file)]
}

function isValidApiVersion(file: ExportCCFile) {
    const { apiVersion } = file
    const hasApiVersion = apiVersion !== undefined
    const versionRegExp = /\d\.\d/
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
