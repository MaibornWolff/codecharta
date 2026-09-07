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

/*
 * The dependency graph in both of its projections: the physical one (`edges` between file nodes, plus
 * each node's place in that graph) and the logical one the code declares (`leaves` are the declarations,
 * `namespaces` the packages containing them, `leafEdges` the dependencies between declarations). The
 * logical tables are keyed by dotted logical path; a leaf joins back onto the file tree through `nodeId`.
 */
interface DependencyLensData {
    edges: DependencyEdge[]
    attributeTypes: Record<string, AttributeTypeValue>
    attributeDescriptors: AttributeDescriptors
    /** Optional so an unused lens slot stays `{}`, the form the analysis side treats as carrying nothing. */
    nodes?: Record<string, DependencyLensNode>
    namespaces?: Record<string, DependencyLensNamespace>
    leaves?: Record<string, DependencyLensLeaf>
    leafEdges?: DependencyLeafEdge[]
}

interface DependencyLensNode {
    level: number
}

interface DependencyLensNamespace {
    level: number
}

/*
 * `name` is carried rather than derived from the key because the logical path escapes dots inside a
 * segment and that escaping is not reversible. `level` is absent when the producer skipped levelization.
 */
interface DependencyLensLeaf {
    nodeId: string
    name: string
    kind: DeclarationKind
    level?: number
}

type DeclarationKind =
    | "CLASS"
    | "VALUECLASS"
    | "INTERFACE"
    | "ANNOTATION"
    | "ENUM"
    | "FUNCTION"
    | "VARIABLE"
    | "REEXPORT"
    | "SCRIPT"
    | "UNKNOWN"

type TypeOfUsage = "usage" | "inheritance" | "implementation" | "instantiation" | "argument" | "return_value" | "constant_access"

/*
 * A dependency between two declarations. Separate from `edges` because an edge addresses file nodes by
 * id; an edge between two declarations of the same file has no file-level counterpart at all.
 */
interface DependencyLeafEdge {
    fromLeaf: string
    toLeaf: string
    attributes: Record<string, number>
    usage?: TypeOfUsage[]
    isCyclic?: boolean
    isPointingUpwards?: boolean
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
