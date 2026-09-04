import { AttributeDescriptors, AttributeTypeValue, BlacklistItem, DomainWord, FixedPosition, MarkedPackage, NodeType } from "./domain.model"

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
    domain?: DomainLens
    /*
     * Opaque passthrough — the schema defines the clusters lens, but the viz neither reads nor
     * renders it yet. The typed model lands with the first producer.
     */
    clusters?: unknown
}

interface DomainLens {
    /** Optional so an unused lens slot stays `{}`, the form the analysis side treats as carrying nothing. */
    nodes?: Record<string, DomainNode>
}

interface DomainNode {
    words: DomainWord[]
}

interface MetricsLensData {
    attributes: Record<string, Record<string, number | number[]>>
    attributeDescriptors: AttributeDescriptors
    attributeTypes: Record<string, AttributeTypeValue>
}

interface DependencyLensData {
    edges: DependencyEdge[]
    attributeTypes: Record<string, AttributeTypeValue>
    attributeDescriptors: AttributeDescriptors
    /** Optional so an unused lens slot stays `{}`, the form the analysis side treats as carrying nothing. */
    nodes?: Record<string, DependencyLensNode>
}

interface DependencyLensNode {
    level: number
}

/*
 * `isCyclic` and `isPointingUpwards` place the edge in the dependency graph; the four edge types
 * (regular, cyclic, container-level feedback, leaf-level feedback) are a pure function of that pair
 * and are derived where they are consumed. Absent means false.
 */
interface DependencyEdge {
    fromId: string
    toId: string
    attributes: Record<string, number>
    isCyclic?: boolean
    isPointingUpwards?: boolean
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
