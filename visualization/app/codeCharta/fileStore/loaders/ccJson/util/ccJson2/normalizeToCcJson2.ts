import { ExportBlacklistItem, ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "../../../../../codeCharta.api.model"
import { AttributeTypes, BlacklistItem, CodeMapNode } from "../../../../../codeCharta.model"
import { CcJson2, FileNode } from "../../../../../model/ccjson2.model"

/**
 * Normalizes a legacy 1.x export into the internal cc.json 2.0 model, so the whole load pipeline has a
 * single 2.0 path (`mapCcJson2ToCCFile`) instead of branching on version. 1.x nodes have no `id`, so we
 * synthesise a path-based id (the reader maps `id` -> `/root/...` path anyway, so edges resolve
 * identically). The 1.x-only fields the app still needs (blacklist, markedPackages, fixedPosition) ride
 * along on the deprecated slots; `repoCreationDate` is dropped (it has no readers).
 */
export function normalizeExportCCFileToCcJson2(file: ExportCCFile): CcJson2 {
    const attributesByNodeId: Record<string, Record<string, number>> = {}
    const rootNode = toFileNode(file.nodes[0], "", attributesByNodeId)
    const attributeTypes = normalizeAttributeTypes(file.attributeTypes)

    return {
        meta: {
            projectName: file.projectName,
            apiVersion: file.apiVersion,
            checksum: file.fileChecksum
        },
        files: [rootNode],
        lenses: {
            metrics: {
                attributes: attributesByNodeId,
                attributeDescriptors: file.attributeDescriptors ?? {},
                attributeTypes: attributeTypes.nodes ?? {}
            },
            dependency: {
                edges: (file.edges ?? []).map(edge => ({
                    fromId: edge.fromNodeName,
                    toId: edge.toNodeName,
                    attributes: { ...edge.attributes }
                })),
                attributeTypes: attributeTypes.edges ?? {},
                attributeDescriptors: {}
            }
        },
        blacklist: toBlacklistItems(file.blacklist),
        markedPackages: file.markedPackages ?? []
    }
}

function toFileNode(node: CodeMapNode, parentPath: string, attributesByNodeId: Record<string, Record<string, number>>): FileNode {
    const path = parentPath === "" ? `/${node.name}` : `${parentPath}/${node.name}`
    if (node.attributes && Object.keys(node.attributes).length > 0) {
        attributesByNodeId[path] = { ...node.attributes }
    }

    const fileNode: FileNode = { id: path, name: node.name, type: node.type }
    if (node.link !== undefined) {
        fileNode.link = node.link
    }
    if (node.fixedPosition !== undefined) {
        fileNode.fixedPosition = node.fixedPosition
    }
    if (node.children !== undefined) {
        fileNode.children = node.children.map(child => toFileNode(child, path, attributesByNodeId))
    }
    return fileNode
}

/** Mirrors the legacy `getAttributeTypes`: the old array-shaped `OldAttributeTypes` collapses to empty maps. */
function normalizeAttributeTypes(attributeTypes: AttributeTypes | OldAttributeTypes | undefined): AttributeTypes {
    if (!attributeTypes || Array.isArray(attributeTypes.nodes) || Array.isArray(attributeTypes.edges)) {
        return { nodes: {}, edges: {} }
    }
    return { nodes: attributeTypes.nodes ?? {}, edges: attributeTypes.edges ?? {} }
}

/** Converts the legacy export blacklist (with the old `hide` type) into internal `BlacklistItem`s. */
function toBlacklistItems(blacklist: ExportBlacklistItem[] = []): BlacklistItem[] {
    return blacklist.map(entry => ({
        path: entry.path,
        type: entry.type === ExportBlacklistType.hide ? "flatten" : "exclude"
    }))
}
