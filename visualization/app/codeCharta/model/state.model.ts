import {
    CCFile,
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    FileSettings,
    LabelMode,
    LayoutAlgorithm,
    MapColors,
    PrimaryMetrics,
    Scaling,
    SortingOption
} from "./domain.model"

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
    dynamicSettings: DynamicSettings
    appSettings: AppSettings
    mapState: MapState
}

export interface DynamicSettings extends PrimaryMetrics {
    colorMode: ColorMode
    sortingOption: SortingOption
    colorRange: ColorRange
    distributionMetric: string
    focusedNodePath: string[]
    searchPattern: string
    margin: number
}

// The map-view state home (Slice 5): the purely-visual leaf settings that were
// previously combined under appSettings now live under their own state.mapState root.
export interface MapState {
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
}

export interface AppSettings {
    isPresentationMode: boolean
    resetCameraIfNewFileIsLoaded: boolean
    isLoadingMap: boolean
    isLoadingFile: boolean
    sortingOrderAscending: boolean
    layoutAlgorithm: LayoutAlgorithm
    maxTreeMapFiles: number
    experimentalFeaturesEnabled: boolean
    screenshotToClipboardEnabled: boolean
    isColorMetricLinkedToHeightMetric: boolean
}

export interface CcState {
    fileSettings: FileSettings
    dynamicSettings: DynamicSettings
    appSettings: AppSettings
    mapState: MapState
    files: FileState[]
    appStatus: AppStatus
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

export interface AppStatus {
    currentFilesAreSampleFiles: boolean
    hoveredNodeId: number | null
    selectedBuildingId: number | null
    rightClickedNodeData: {
        nodeId: number
        xPositionOfRightClickEvent: number
        yPositionOfRightClickEvent: number
        origin: "codeMap" | "explorer"
    } | null
}
