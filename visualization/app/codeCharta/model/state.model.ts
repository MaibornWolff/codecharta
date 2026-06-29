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

export interface AppSettings {
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
    isPresentationMode: boolean
    showOutgoingEdges: boolean
    showIncomingEdges: boolean
    showOnlyBuildingsWithEdges: boolean
    isEdgeMetricVisible: boolean
    resetCameraIfNewFileIsLoaded: boolean
    isLoadingMap: boolean
    isLoadingFile: boolean
    sortingOrderAscending: boolean
    showMetricLabelNameValue: boolean
    showMetricLabelNodeName: boolean
    layoutAlgorithm: LayoutAlgorithm
    maxTreeMapFiles: number
    experimentalFeaturesEnabled: boolean
    screenshotToClipboardEnabled: boolean
    colorLabels: ColorLabelOptions
    labelMode: LabelMode
    groupLabelCollisions: boolean
    labelsPerMap: boolean
    isColorMetricLinkedToHeightMetric: boolean
    enableFloorLabels: boolean
}

export interface CcState {
    fileSettings: FileSettings
    dynamicSettings: DynamicSettings
    appSettings: AppSettings
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
