import { Vector3 } from "three"
import Rectangle from "./rectangle"

export type Scaling = {
    x: number
    y: number
    z: number
}

export enum LayoutAlgorithm {
    SquarifiedTreeMap = "Squarified TreeMap",
    StreetMap = "StreetMap",
    TreeMapStreet = "TreeMapStreet"
}

export interface CCFile {
    map: CodeMapNode
    settings: {
        // The on-disk .cc.json file settings carry all groups. Several were split out of the STATE
        // `fileSettings` root but stay bundled per-file (hence the intersection): the cc.json SOURCE the
        // metrics lens owns (node `attributeTypes` + `attributeDescriptors`, `MetricsLensSource`, Slice 9a),
        // the edge `attributeTypes` the dependency lens owns (`DependencyLensSource`, Slice 14 — the same
        // per-file `attributeTypes` key, so intersecting is a no-op on the resolved type), and the
        // `blacklist` (Slice 9b) + `markedPackages` (Slice 9c) the sharedView home now owns.
        fileSettings: FileSettings &
            MetricsLensSource &
            DependencyLensSource & { blacklist: Array<BlacklistItem>; markedPackages: Array<MarkedPackage> }
    }
    fileMeta: FileMeta
}

export interface FileCount {
    all?: number
    added: number
    removed: number
    changed: number
}

interface SquarifiedNode {
    name: string
    id?: number
    type: NodeType
    children?: CodeMapNode[]
    attributes?: KeyValuePair
    edgeAttributes?: {
        [key: string]: EdgeMetricCount
    }
    link?: string
    path?: string
    isExcluded?: boolean
    isFlattened?: boolean
    deltas?: {
        [key: string]: number
    }
    fixedPosition?: FixedPosition
    fileCount?: FileCount
}

interface StreetNode {
    value?: number
    rect?: Rectangle
    zOffset?: number
}
export interface CodeMapNode extends SquarifiedNode, StreetNode {}

export interface FixedPosition {
    left: number
    top: number
    width: number
    height: number
}

export enum NodeType {
    FILE = "File",
    FOLDER = "Folder"
}

export enum SortingOption {
    NAME = "Name",
    NUMBER_OF_FILES = "Number of Files",
    AREA_SIZE = "Area Size"
}

export interface Sorting {
    option: SortingOption
    orderAscending: boolean
}

export interface ColorLabelOptions {
    positive: boolean
    negative: boolean
    neutral: boolean
}

export const colorLabelTypes: readonly (keyof ColorLabelOptions)[] = ["positive", "neutral", "negative"] as const

export enum LabelMode {
    Height = "height",
    Color = "color"
}

export interface FileMeta {
    fileName: string
    fileChecksum: string
    apiVersion: string
    projectName: string
    exportedFileSize: number
    repoCreationDate?: string
}

// The STATE fileSettings root (shrinking as the grab-bag dissolves): Slice 9a moved attributeTypes +
// attributeDescriptors to state.metricsLensSource, Slice 9b moved blacklist and Slice 9c markedPackages
// to state.sharedView. The on-disk .cc.json file still carries all of them per-file — see the
// intersection on CCFile.settings.fileSettings. Only edges remains here (DEFERRED — a merged render-model
// array); it is re-homed by a later edge-UI / render-model slice, which then deletes this reducer.
export interface FileSettings {
    edges: Edge[]
}

// The cc.json SOURCE owned by the metrics lens (Slice 9a): the NODE attribute-type map (in
// `attributeTypes.nodes`) and the flat attribute-descriptor map. Split out of `FileSettings` into its own
// `state.metricsLensSource` root; still bundled into per-file `CCFile.settings.fileSettings` (an
// intersection) since the .cc.json file carries them. The EDGE side of `attributeTypes` was re-homed to
// the dependency lens's `DependencyLensSource` in Slice 14 (the runtime `attributeTypes.edges` here is now
// empty; the type stays the full `AttributeTypes` shape because the per-file .cc.json carries both sides).
export interface MetricsLensSource {
    attributeTypes: AttributeTypes
    attributeDescriptors: AttributeDescriptors
}

// The cc.json SOURCE owned by the dependency lens (Slice 14): the EDGE attribute-type map (in
// `attributeTypes.edges`). The twin of `MetricsLensSource`, one step later — Slice 9a transiently parked
// the edge side in the metrics lens's `state.metricsLensSource`; this slice re-homes it to its own
// `state.dependencyLensSource` root. Per ADR 12 the dependency lens owns edge attribute types. Still
// bundled into per-file `CCFile.settings.fileSettings` (an intersection) — the same `attributeTypes` key
// the file carries, so the .cc.json round-trips both node and edge types.
export interface DependencyLensSource {
    attributeTypes: AttributeTypes
}

export interface PrimaryMetrics {
    areaMetric: string
    heightMetric: string
    edgeMetric: string
    colorMetric: string
}

export interface MapColors {
    positive: string
    neutral: string
    negative: string
    selected: string
    positiveDelta: string
    negativeDelta: string
    base: string
    flat: string
    markingColors: string[]
    outgoingEdge: string
    incomingEdge: string
    labelColorAndAlpha: { rgb: string; alpha: number }
    /** Tracks whether positive/negative were swapped, so the Invert Colors
     * checkbox stays meaningful after individual colors are customized. */
    isColorRangeInverted?: boolean
    areDeltaColorsInverted?: boolean
}

export type HexMapColor = keyof Omit<MapColors, "labelColorAndAlpha" | "markingColors" | "isColorRangeInverted" | "areDeltaColorsInverted">

export interface ColorRange {
    /** null means to be reset */
    from: number | null
    /** null means to be reset */
    to: number | null
}

export interface AttributeTypes {
    nodes?: { [key: string]: AttributeTypeValue }
    edges?: { [key: string]: AttributeTypeValue }
}

export interface AttributeDescriptors {
    [key: string]: AttributeDescriptor
}

export interface AttributeDescriptor {
    title: string
    description: string
    hintLowValue: string
    hintHighValue: string
    link: string
    direction?: number
}

export enum AttributeTypeValue {
    absolute = "absolute",
    relative = "relative"
}

export enum ColorMode {
    trueGradient = "trueGradient",
    weightedGradient = "weightedGradient",
    focusedGradient = "focusedGradient",
    absolute = "absolute"
}

export interface Edge {
    fromNodeName: string
    toNodeName: string
    attributes: KeyValuePair
    visible?: EdgeVisibility
}

export enum EdgeVisibility {
    none = "none",
    from = "from",
    to = "to",
    both = "both"
}

export interface EdgeMetricCount {
    incoming: number
    outgoing: number
}

export type EdgeMetricCountMap = Map<string, EdgeMetricCount>
export type NodeEdgeMetricsMap = Map<string, EdgeMetricCountMap>

export interface BlacklistItem {
    path: string
    type: BlacklistType
    nodeType?: NodeType
}

export type BlacklistType = "flatten" | "exclude"

export interface MarkedPackage {
    path: string
    color: string
}

export interface EdgeMetricData {
    name: string
    maxValue: number
    minValue: number
    values: number[]
}

export interface NodeMetricData {
    name: string
    maxValue: number
    minValue: number
    values: number[]
}

export interface MetricData {
    nodeMetricData: NodeMetricData[]
    edgeMetricData: EdgeMetricData[]
}

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> }

export interface KeyValuePair {
    [key: string]: number
}

export interface Node {
    name: string
    id: number
    width: number
    height: number
    length: number
    depth: number
    mapNodeDepth: number
    x0: number
    z0: number
    y0: number
    isLeaf: boolean
    deltas?: KeyValuePair
    attributes: KeyValuePair
    edgeAttributes: {
        [key: string]: EdgeMetricCount
    }
    heightDelta: number
    visible: boolean
    path: string
    link: string
    markingColor: string | void
    flat: boolean
    color: string
    incomingEdgePoint: Vector3
    outgoingEdgePoint: Vector3
}
