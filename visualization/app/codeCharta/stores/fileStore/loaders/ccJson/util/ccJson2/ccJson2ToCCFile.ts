import {
    CcJson2,
    CcJson2WithCarryover,
    DependencyLensData,
    DependencyLensLeaf,
    FileNodeWithCarryover
} from "../../../../../../model/ccjson2.model"
import { NameDataPair } from "../../../../../../model/codeCharta.api.model"
import {
    AttributeDescriptor,
    AttributeDescriptors,
    AttributeTypes,
    CCFile,
    CodeMapNode,
    DependencyDeclarationData,
    DependencyLeaf,
    DependencyLeafEdge,
    DependencyLevelData,
    DomainLensData,
    Edge,
    KeyValuePair
} from "../../../../../../model/codeCharta.model"

export function mapCcJson2ToCCFile(file: CcJson2WithCarryover, nameDataPair: NameDataPair): CCFile {
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
                domainWords: mapDomainWords(file, idToPath),
                dependencyLevels: mapDependencyLevels(file, idToPath),
                dependencyDeclarations: mapDependencyDeclarations(file, idToPath),
                // 2.0 files carry neither; both are populated only when a 1.x file is normalized.
                blacklist: file.blacklist ?? [],
                markedPackages: file.markedPackages ?? []
            }
        },
        map
    }
}

function mapFileNode(
    node: FileNodeWithCarryover,
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
    // fixedPosition only exists on a normalized 1.x node; the treemap layout pins fixed folders by it.
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
        edges.push({
            fromNodeName,
            toNodeName,
            attributes: { ...edge.attributes },
            isCyclic: edge.isCyclic,
            isPointingUpwards: edge.isPointingUpwards
        })
    }
    return edges
}

function mapDependencyLevels(file: CcJson2, idToPath: Record<string, string>): DependencyLevelData {
    const levels: DependencyLevelData = {}
    for (const [nodeId, node] of Object.entries(file.lenses.dependency?.nodes ?? {})) {
        const path = idToPath[nodeId]
        if (path === undefined) {
            console.warn(`Dropping dependency-lens level with unresolved node id: ${nodeId}`)
            continue
        }
        levels[path] = node.level
    }
    return levels
}

function mapDependencyDeclarations(file: CcJson2, idToPath: Record<string, string>): DependencyDeclarationData {
    const { namespaces, leaves, leafEdges } = file.lenses.dependency ?? {}
    const declarations: DependencyDeclarationData = {}
    if (namespaces !== undefined) {
        declarations.namespaces = namespaces
    }
    if (leaves !== undefined) {
        declarations.leaves = mapLeaves(leaves, idToPath)
    }
    if (leafEdges !== undefined) {
        declarations.leafEdges = mapLeafEdges(leafEdges, idToPath)
    }
    return declarations
}

function mapLeaves(leaves: DependencyLensData["leaves"], idToPath: Record<string, string>): DependencyDeclarationData["leaves"] {
    const leavesByPath: DependencyDeclarationData["leaves"] = {}
    for (const [nodeId, leavesOfFile] of Object.entries(leaves)) {
        const path = idToPath[nodeId]
        if (path === undefined) {
            console.warn(`Dropping dependency-lens declarations with unresolved node id: ${nodeId}`)
            continue
        }
        leavesByPath[path] = Object.fromEntries(Object.entries(leavesOfFile).map(([key, leaf]) => [key, mapLeaf(key, leaf)]))
    }
    return leavesByPath
}

function mapLeaf(key: string, { name = key, kind, namespace, level }: DependencyLensLeaf): DependencyLeaf {
    return { name, kind, ...(namespace !== undefined && { namespace }), ...(level !== undefined && { level }) }
}

function mapLeafEdges(leafEdges: DependencyLensData["leafEdges"], idToPath: Record<string, string>): DependencyLeafEdge[] {
    const mapped: DependencyLeafEdge[] = []
    for (const edge of leafEdges) {
        const fromNodeName = idToPath[edge.fromId]
        const toNodeName = idToPath[edge.toId]
        if (fromNodeName === undefined || toNodeName === undefined) {
            console.warn(`Dropping declaration edge with unresolved endpoint(s): ${edge.fromId} -> ${edge.toId}`)
            continue
        }
        mapped.push({
            fromNodeName,
            fromLeaf: edge.fromLeaf,
            toNodeName,
            toLeaf: edge.toLeaf,
            attributes: { ...edge.attributes },
            usage: [...(edge.usage ?? [])],
            isCyclic: edge.isCyclic,
            isPointingUpwards: edge.isPointingUpwards
        })
    }
    return mapped
}

function mapDomainWords(file: CcJson2, idToPath: Record<string, string>): DomainLensData {
    const domainWords: DomainLensData = {}
    for (const [nodeId, node] of Object.entries(file.lenses.domain?.nodes ?? {})) {
        const path = idToPath[nodeId]
        if (path === undefined) {
            console.warn(`Dropping domain-lens words with unresolved node id: ${nodeId}`)
            continue
        }
        domainWords[path] = node.words
    }
    return domainWords
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
