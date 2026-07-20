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
    Sorting
} from "./domain.model"
import { WordCloudSettings } from "./wordCloud.model"

// The default number of top-value labels shown on the map. A plain domain default (not ngrx state),
// so it lives in model/ where both the mapState amountOfTopLabels reducer and the pure
// getNumberOfTopLabels helper can read it without the helper importing a state home (util-is-a-leaf-kernel).
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

// Shared renderer view state: focus stack, search pattern, blacklist, marked packages, interaction ids.
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
    domainBar: WordCloudSettings
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
