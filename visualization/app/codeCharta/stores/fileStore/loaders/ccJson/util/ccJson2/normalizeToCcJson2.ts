import { CcJson2WithCarryover, FileNodeWithCarryover } from "../../../../../../model/ccjson2.model"
import { ExportBlacklistItem, ExportBlacklistType, ExportCCFile, OldAttributeTypes } from "../../../../../../model/codeCharta.api.model"
import { AttributeTypes, BlacklistItem, CodeMapNode } from "../../../../../../model/codeCharta.model"

// 1.x allows a File and a Folder with the same name under one parent; ids include the type to keep them distinct.
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

function normalizeAttributeTypes(attributeTypes: AttributeTypes | OldAttributeTypes | undefined): AttributeTypes {
    if (!attributeTypes || Array.isArray(attributeTypes.nodes) || Array.isArray(attributeTypes.edges)) {
        return { nodes: {}, edges: {} }
    }
    return { nodes: attributeTypes.nodes ?? {}, edges: attributeTypes.edges ?? {} }
}

function toBlacklistItems(blacklist: ExportBlacklistItem[] = []): BlacklistItem[] {
    return blacklist.map(entry => ({
        path: entry.path,
        type: entry.type === ExportBlacklistType.hide ? "flatten" : "exclude"
    }))
}
