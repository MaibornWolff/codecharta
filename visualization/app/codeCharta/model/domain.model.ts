import { Vector3 } from "three"
import Rectangle from "../util/algorithm/streetLayout/rectangle"

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
        fileSettings: FileSettings
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
    attributeTypes: AttributeTypes
    attributeDescriptors: AttributeDescriptors
    blacklist: Array<BlacklistItem>
    edges: Edge[]
    markedPackages: MarkedPackage[]
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
