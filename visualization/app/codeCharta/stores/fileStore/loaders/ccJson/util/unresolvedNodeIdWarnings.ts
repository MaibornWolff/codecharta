import { CcJson2, FileNode } from "../../../../../model/ccjson2.model"
import { ERROR_MESSAGES } from "./fileValidationMessages"

/**
 * cc.json 2.0 dependency edges and domain-lens word banks reference nodes by id; the 2.0 reader silently
 * drops any of them whose id is absent from the file tree (mapEdges, mapDomainWords). Surface each drop as
 * a load warning so it shows in the load-warnings dialog instead of only console.warn.
 */
export function collectUnresolvedNodeIdWarnings(file: CcJson2): string[] {
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
