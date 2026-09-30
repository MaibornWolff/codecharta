import Ajv, { ErrorObject } from "ajv"
import packageJson from "../../../../../../../package.json"
import { CcJson2 } from "../../../../../model/ccjson2.model"
import { ExportCCFile } from "../../../../../model/codeCharta.api.model"
import { CodeMapNode } from "../../../../../model/codeCharta.model"
import ccJson2Schema from "../../../../../util/ccJson2Schema.json"
import jsonSchema from "../../../../../util/generatedSchema.json"
import { getAsApiVersion } from "./apiVersion"
import { ERROR_MESSAGES } from "./fileValidationMessages"
import { validateFixedFolders } from "./fixedFolderValidator"
import { validateAllFileNodeIdsAreUnique, validateAllFileNodesAreUnique, validateAllNodesAreUnique } from "./nodeUniquenessValidator"
import { collectUnresolvedNodeIdWarnings } from "./unresolvedNodeIdWarnings"

export { getAsApiVersion } from "./apiVersion"
export { ERROR_MESSAGES } from "./fileValidationMessages"

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
    return [...validateAllFileNodeIdsAreUnique(file.files[0]), ...validateAllFileNodesAreUnique(file.files[0])]
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
