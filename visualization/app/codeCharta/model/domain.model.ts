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
        fileSettings: FileSettings & {
            attributeTypes: AttributeTypes
            attributeDescriptors: AttributeDescriptors
            blacklist: Array<BlacklistItem>
            markedPackages: Array<MarkedPackage>
            domainWords: DomainLensData
        }
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

export interface FileSettings {
    edges: Edge[]
}

export interface MetricsLensSource {
    attributeTypes: AttributeTypeMap
    attributeDescriptors: AttributeDescriptors
}

export interface DependencyLensSource {
    attributeTypes: AttributeTypeMap
}

export type DomainLensData = Record<string, DomainWord[]>

export interface DomainWord {
    text: string
    frequency: number
    tfidf?: number
}

export interface DomainLensSource {
    words: DomainLensData
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

export type AttributeTypeMap = { [key: string]: AttributeTypeValue }

export interface AttributeTypes {
    nodes?: AttributeTypeMap
    edges?: AttributeTypeMap
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

export type MetricRuleOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "between"

/**
 * A flatten or exclude rule stated as a condition on a metric rather than a path. It stays a
 * condition in state and is re-evaluated on every render, so it keeps meaning the same thing when
 * newer data is loaded. It addresses files only — a folder's metrics are aggregates of its
 * contents, which is a different question from the one this rule asks.
 */
export interface MetricRule {
    id: string
    metric: string
    operator: MetricRuleOperator
    value: number
    /** The inclusive upper bound, set only when the operator is `between`. */
    upperValue?: number
    type: BlacklistType
}

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
