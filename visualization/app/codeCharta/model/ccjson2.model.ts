import { AttributeDescriptors, AttributeTypeValue, BlacklistItem, FixedPosition, MarkedPackage, NodeType } from "./domain.model"

/**
 * cc.json 2.0 domain types: the `{ meta, files, lenses }` shape.
 *
 * This is the single source of the 2.0 shape on the visualization side — a TS port of the
 * analysis-side wire DTO (`analysis/.../serialization/dto/CcJsonV2.kt`) expressed as visualization
 * *domain* types. The 2.0 ingestion reader (step 2) reuses these; they are not redeclared in
 * `codeCharta.api.model.ts`.
 *
 * Reuse caveats (Slice 1):
 * - The viz `AttributeDescriptor` has no `analyzers` field, so the 2.0 schema's `analyzers` is
 *   dropped on read (acceptable for Slice 1).
 * - `attributes` values may be list-valued (`number[]`, e.g. authors), which today's `KeyValuePair`
 *   does not model — the reader strips non-numeric values before they reach `CodeMapNode.attributes`.
 *
 * Import these types directly; do not add them to the `codeCharta.model.ts` barrel.
 */
export interface CcJson2 {
    meta: Meta2
    /** Exactly one root folder. */
    files: FileNode[]
    lenses: Lenses
    /**
     * @deprecated 1.x-normalization carryover — NOT part of cc.json 2.0. Legacy 1.x files embed
     * exclude/flatten rules; the normalizer copies them here so they survive. Remove when 1.x
     * ingestion is dropped. 2.0 files never set this.
     */
    blacklist?: BlacklistItem[]
    /**
     * @deprecated 1.x-normalization carryover — NOT part of cc.json 2.0. Legacy 1.x files embed
     * marked-folder colors; the normalizer copies them here. Remove when 1.x ingestion is dropped.
     */
    markedPackages?: MarkedPackage[]
}

export interface Meta2 {
    projectName: string
    apiVersion: string
    checksum: string
    commitHash?: string
}

export interface FileNode {
    /** The stable string id the analysis writes; the join key into `lenses.metrics.attributes`. */
    id: string
    name: string
    type: NodeType
    children?: FileNode[]
    contentHash?: string
    link?: string
    /**
     * @deprecated 1.x-normalization carryover — NOT part of cc.json 2.0. Legacy 1.x files embed
     * fixed-folder placement on nodes; the normalizer copies it so the treemap layout still pins
     * fixed folders. Remove when 1.x ingestion is dropped. 2.0 files never set this.
     */
    fixedPosition?: FixedPosition
}

export interface Lenses {
    metrics?: MetricsLensData
    dependency?: DependencyLensData
    /** Reserved/unknown top-level lenses (e.g. domain, security) round-tripped verbatim. */
    opaqueLenses?: Record<string, unknown>
}

export interface MetricsLensData {
    /** Keyed by the string node `id`; metric name → value (scalar or list-valued). */
    attributes: Record<string, Record<string, number | number[]>>
    attributeDescriptors: AttributeDescriptors
    attributeTypes: Record<string, AttributeTypeValue>
    clusters?: unknown[]
}

export interface DependencyLensData {
    edges: DependencyEdge[]
    attributeTypes: Record<string, AttributeTypeValue>
    attributeDescriptors: AttributeDescriptors
}

export interface DependencyEdge {
    fromId: string
    toId: string
    attributes: Record<string, number>
}
