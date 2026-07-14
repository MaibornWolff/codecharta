import { AttributeDescriptors, AttributeTypeValue, BlacklistItem, FixedPosition, MarkedPackage, NodeType } from "./domain.model"

export interface CcJson2 {
    meta: Meta2
    files: FileNode[]
    lenses: Lenses
}

interface Meta2 {
    projectName: string
    apiVersion: string
    checksum: string
    commitHash?: string
}

export interface FileNode {
    id: string
    name: string
    type: NodeType
    children?: FileNode[]
    contentHash?: string
    link?: string
}

interface Lenses {
    metrics?: MetricsLensData
    dependency?: DependencyLensData
}

interface MetricsLensData {
    attributes: Record<string, Record<string, number | number[]>>
    attributeDescriptors: AttributeDescriptors
    attributeTypes: Record<string, AttributeTypeValue>
    clusters?: unknown[]
}

interface DependencyLensData {
    edges: DependencyEdge[]
    attributeTypes: Record<string, AttributeTypeValue>
    attributeDescriptors: AttributeDescriptors
}

interface DependencyEdge {
    fromId: string
    toId: string
    attributes: Record<string, number>
}

/*
 * 1.x carryover fields — NOT part of cc.json 2.0; set by `normalizeToCcJson2` so the reader
 * can still apply legacy exclude/flatten rules, marked-folder colors, and fixed placement.
 */

export interface FileNodeWithCarryover extends FileNode {
    fixedPosition?: FixedPosition
    children?: FileNodeWithCarryover[]
}

export type CcJson2WithCarryover = Omit<CcJson2, "files"> & {
    files: FileNodeWithCarryover[]
    blacklist?: BlacklistItem[]
    markedPackages?: MarkedPackage[]
}
