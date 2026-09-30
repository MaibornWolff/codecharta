import { FileNode } from "../../../../../model/ccjson2.model"
import { CodeMapNode } from "../../../../../model/codeCharta.model"
import { isLeaf } from "../../../../../util/codeMapHelper"
import { ERROR_MESSAGES } from "./fileValidationMessages"

export function validateAllNodesAreUnique(node: CodeMapNode) {
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

export function validateAllFileNodeIdsAreUnique(root: FileNode): string[] {
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
export function validateAllFileNodesAreUnique(root: FileNode): string[] {
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
