import {
    BlacklistItem,
    CCFile,
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    DependencyLensSource,
    DomainLensSource,
    FileSettings,
    LabelMode,
    LayoutAlgorithm,
    MapColors,
    MarkedPackage,
    MetricsLensSource,
    PrimaryMetrics,
    Scaling,
    Sorting,
    SortingOption
} from "./domain.model"
import { WordCloudSettings } from "./wordCloud.model"

export interface DomainState extends WordCloudSettings {
    sortingOrder: SortingOption
    sortingOrderAscending: boolean
    searchPattern: string
    /** Words the reader dropped from the domain view; they leave the cloud and the explorer's word list alike. */
    hiddenWords: string[]
}

export const defaultAmountOfTopLabels = 10

export enum FileSelectionState {
    Reference = "Reference",
    Comparison = "Comparison",
    Partial = "Partial",
    None = "None"
}

export interface FileState {
    file: CCFile
    selectedAs: FileSelectionState
}

export interface Settings {
    fileSettings: FileSettings
    preferences: Preferences
    mapState: MapState
    sharedView: SharedView
}

export interface Preferences {
    isPresentationMode: boolean
    resetCameraIfNewFileIsLoaded: boolean
    maxTreeMapFiles: number
    experimentalFeaturesEnabled: boolean
    screenshotToClipboardEnabled: boolean
    isColorMetricLinkedToHeightMetric: boolean
    sorting: Sorting
}

export interface SharedView {
    focusedNodePath: string[]
    searchPattern: string
    blacklist: BlacklistItem[]
    markedPackages: MarkedPackage[]
    hoveredNodeId: string | null
    selectedBuildingId: string | null
    rightClickedNodeData: {
        nodeId: string
        xPositionOfRightClickEvent: number
        yPositionOfRightClickEvent: number
        origin: "codeMap" | "explorer"
    } | null
}

export interface MapState extends PrimaryMetrics {
    distributionMetric: string
    amountOfTopLabels: number
    labelSize: number
    amountOfEdgePreviews: number
    edgeHeight: number
    scaling: Scaling
    hideFlatBuildings: boolean
    invertHeight: boolean
    invertArea: boolean
    isWhiteBackground: boolean
    mapColors: MapColors
    showOutgoingEdges: boolean
    showIncomingEdges: boolean
    showOnlyBuildingsWithEdges: boolean
    isEdgeMetricVisible: boolean
    showMetricLabelNameValue: boolean
    showMetricLabelNodeName: boolean
    colorLabels: ColorLabelOptions
    labelMode: LabelMode
    groupLabelCollisions: boolean
    labelsPerMap: boolean
    enableFloorLabels: boolean
    colorMode: ColorMode
    colorRange: ColorRange
    margin: number
    layoutAlgorithm: LayoutAlgorithm
}

export interface CcState {
    metricsLensSource: MetricsLensSource
    dependencyLensSource: DependencyLensSource
    domainLensSource: DomainLensSource
    domainState: DomainState
    preferences: Preferences
    mapState: MapState
    sharedView: SharedView
    files: FileState[]
    isLoadingFile: boolean
    currentFilesAreSampleFiles: boolean
}

export function stateObjectReplacer(_, valueToReplace) {
    if (valueToReplace instanceof Map) {
        return {
            dataType: "Map",
            value: [...valueToReplace.entries()]
        }
    }
    if (valueToReplace instanceof Set) {
        return {
            dataType: "Set",
            value: [...valueToReplace]
        }
    }
    return valueToReplace
}

export function stateObjectReviver(_, valueToRevive) {
    if (valueToRevive?.dataType === "Map") {
        return new Map(valueToRevive.value)
    }
    if (valueToRevive?.dataType === "Set") {
        return new Set(valueToRevive.value)
    }

    return valueToRevive
}
