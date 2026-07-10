import { CcJson2WithCarryover, FileNodeWithCarryover } from "../../../../../../model/ccjson2.model"
import { ExportBlacklistItem, ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "../../../../../../model/codeCharta.api.model"
import { AttributeTypes, BlacklistItem, CodeMapNode } from "../../../../../../model/codeCharta.model"

/**
 * Normalizes a legacy 1.x export into the internal cc.json 2.0 model, so the whole load pipeline has a
 * single 2.0 path (`mapCcJson2ToCCFile`) instead of branching on version. 1.x nodes have no `id`, so we
 * synthesise one from the node's path AND type (`/root/foo|File`): 1.x legally allows a File and a
 * Folder with the same name under one parent, and keying on the bare path alone would collapse them
 * (the second attributes clobber the first, both read one bag). Edges carry only paths, so we qualify
 * each endpoint with the type of the node at that path (defaulting File) so it still resolves. The
 * 1.x-only fields the app still needs (blacklist, markedPackages, fixedPosition) ride along on the
 * carryover types; `repoCreationDate` is dropped (it has no readers).
 */
export function normalizeExportCCFileToCcJson2(file: ExportCCFile): CcJson2WithCarryover {
    const attributesByNodeId: Record<string, Record<string, number>> = {}
    const typeByPath: Record<string, string> = {}
    const rootNode = toFileNode(file.nodes[0], "", attributesByNodeId, typeByPath)
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
                    fromId: qualifiedNodeId(edge.fromNodeName, typeByPath[edge.fromNodeName]),
                    toId: qualifiedNodeId(edge.toNodeName, typeByPath[edge.toNodeName]),
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

/** Join key into the metrics/edge lenses: a node's path plus its type, so File/Folder siblings differ. */
function qualifiedNodeId(path: string, type: string | undefined): string {
    return `${path}|${type ?? "File"}`
}

function toFileNode(
    node: CodeMapNode,
    parentPath: string,
    attributesByNodeId: Record<string, Record<string, number>>,
    typeByPath: Record<string, string>
): FileNodeWithCarryover {
    const path = parentPath === "" ? `/${node.name}` : `${parentPath}/${node.name}`
    const id = qualifiedNodeId(path, node.type)
    typeByPath[path] = node.type
    if (node.attributes && Object.keys(node.attributes).length > 0) {
        attributesByNodeId[id] = { ...node.attributes }
    }

    const fileNode: FileNodeWithCarryover = { id, name: node.name, type: node.type }
    if (node.link !== undefined) {
        fileNode.link = node.link
    }
    if (node.fixedPosition !== undefined) {
        fileNode.fixedPosition = node.fixedPosition
    }
    if (node.children !== undefined) {
        fileNode.children = node.children.map(child => toFileNode(child, path, attributesByNodeId, typeByPath))
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
