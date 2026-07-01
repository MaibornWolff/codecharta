import { NameDataPair } from "../../../../../codeCharta.api.model"
import {
    AttributeDescriptor,
    AttributeDescriptors,
    AttributeTypes,
    CCFile,
    CodeMapNode,
    Edge,
    KeyValuePair
} from "../../../../../codeCharta.model"
import { CcJson2, FileNode } from "../../../../../model/ccjson2.model"

/**
 * Maps a parsed cc.json 2.0 (`{ meta, files, lenses }`) into today's internal `CCFile`, so the map
 * renders identically to a 1.x file. The string `FileNode.id` is the join key into
 * `lenses.metrics.attributes[id]` and `lenses.dependency.edges[].fromId/toId`; the viz never
 * re-hashes — it resolves each `id` to that node's `/root/...` path while walking the tree.
 */
export function mapCcJson2ToCCFile(file: CcJson2, nameDataPair: NameDataPair): CCFile {
    const attributesByNodeId = file.lenses.metrics?.attributes ?? {}
    const idToPath: Record<string, string> = {}
    const map = mapFileNode(file.files[0], "", attributesByNodeId, idToPath)

    return {
        fileMeta: {
            fileName: nameDataPair.fileName,
            fileChecksum: file.meta.checksum,
            projectName: file.meta.projectName,
            apiVersion: file.meta.apiVersion,
            exportedFileSize: nameDataPair.fileSize,
            repoCreationDate: ""
        },
        settings: {
            fileSettings: {
                edges: mapEdges(file, idToPath),
                attributeTypes: getAttributeTypes(file),
                attributeDescriptors: getAttributeDescriptors(file),
                // 2.0 files carry neither; both are populated only when a 1.x file is normalized (deprecated).
                blacklist: file.blacklist ?? [],
                markedPackages: file.markedPackages ?? []
            }
        },
        map
    }
}

function mapFileNode(
    node: FileNode,
    parentPath: string,
    attributesByNodeId: Record<string, Record<string, number | number[]>>,
    idToPath: Record<string, string>
): CodeMapNode {
    const path = parentPath === "" ? `/${node.name}` : `${parentPath}/${node.name}`
    idToPath[node.id] = path

    const mappedNode: CodeMapNode = {
        name: node.name,
        type: node.type,
        attributes: toNumericAttributes(attributesByNodeId[node.id])
    }
    if (node.link !== undefined) {
        mappedNode.link = node.link
    }
    if (node.children !== undefined) {
        mappedNode.children = node.children.map(child => mapFileNode(child, path, attributesByNodeId, idToPath))
    }
    // fixedPosition only exists on a normalized 1.x node (deprecated); the treemap layout pins fixed folders by it.
    if (node.fixedPosition !== undefined) {
        mappedNode.fixedPosition = node.fixedPosition
    }
    return mappedNode
}

/** List-valued (number[]) and non-numeric values are dropped — KeyValuePair/metric math need scalars. */
function toNumericAttributes(attributes: Record<string, number | number[]> = {}): KeyValuePair {
    const numericAttributes: KeyValuePair = {}
    for (const [name, value] of Object.entries(attributes)) {
        if (typeof value === "number") {
            numericAttributes[name] = value
        }
    }
    return numericAttributes
}

function mapEdges(file: CcJson2, idToPath: Record<string, string>): Edge[] {
    const edges: Edge[] = []
    for (const edge of file.lenses.dependency?.edges ?? []) {
        const fromNodeName = idToPath[edge.fromId]
        const toNodeName = idToPath[edge.toId]
        if (fromNodeName === undefined || toNodeName === undefined) {
            console.warn(`Dropping dependency edge with unresolved endpoint(s): ${edge.fromId} -> ${edge.toId}`)
            continue
        }
        edges.push({ fromNodeName, toNodeName, attributes: { ...edge.attributes } })
    }
    return edges
}

function getAttributeTypes(file: CcJson2): AttributeTypes {
    return {
        nodes: file.lenses.metrics?.attributeTypes ?? {},
        edges: file.lenses.dependency?.attributeTypes ?? {}
    }
}

function getAttributeDescriptors(file: CcJson2): AttributeDescriptors {
    return {
        ...pickDescriptors(file.lenses.metrics?.attributeDescriptors),
        ...pickDescriptors(file.lenses.dependency?.attributeDescriptors)
    }
}

/** Keeps only the fields the viz `AttributeDescriptor` models; the 2.0 `analyzers` field is dropped. */
function pickDescriptors(descriptors: AttributeDescriptors = {}): AttributeDescriptors {
    const picked: AttributeDescriptors = {}
    for (const [name, descriptor] of Object.entries(descriptors)) {
        const { title, description, hintLowValue, hintHighValue, link, direction } = descriptor as AttributeDescriptor
        picked[name] = { title, description, hintLowValue, hintHighValue, link, direction }
    }
    return picked
}
