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
}

/** @public cc.json 2.0 contract — consumed by the not-yet-wired 2.0 reader; see file header. */
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
}

/** @public cc.json 2.0 contract — consumed by the not-yet-wired 2.0 reader; see file header. */
export interface Lenses {
    metrics?: MetricsLensData
    dependency?: DependencyLensData
}

/** @public cc.json 2.0 contract — consumed by the not-yet-wired 2.0 reader; see file header. */
export interface MetricsLensData {
    /** Keyed by the string node `id`; metric name → value (scalar or list-valued). */
    attributes: Record<string, Record<string, number | number[]>>
    attributeDescriptors: AttributeDescriptors
    attributeTypes: Record<string, AttributeTypeValue>
    clusters?: unknown[]
}

/** @public cc.json 2.0 contract — consumed by the not-yet-wired 2.0 reader; see file header. */
export interface DependencyLensData {
    edges: DependencyEdge[]
    attributeTypes: Record<string, AttributeTypeValue>
    attributeDescriptors: AttributeDescriptors
}

/** @public cc.json 2.0 contract — consumed by the not-yet-wired 2.0 reader; see file header. */
export interface DependencyEdge {
    fromId: string
    toId: string
    attributes: Record<string, number>
}

/*
 * 1.x → 2.0 normalization carryover. These fields are NOT part of cc.json 2.0, and a native 2.0 file
 * never sets them: `normalizeToCcJson2` copies a legacy file's exclude/flatten rules, marked-folder
 * colors and fixed-folder placement onto them so `ccJson2ToCCFile` can still apply them.
 *
 * They live on their own types rather than on `CcJson2`/`FileNode`, so that reading one is a
 * deliberate act — a consumer of the pure 2.0 types cannot even see them. Tagging them as deprecated
 * on the base types said something different: every linter reads that tag as "stop calling this, it is
 * going away", and flagged the normalizer for doing the one job it exists to do.
 *
 * Delete these two types, and the normalizer with them, when 1.x ingestion is dropped.
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
