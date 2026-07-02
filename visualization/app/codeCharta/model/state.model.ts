import {
    BlacklistItem,
    CCFile,
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    FileSettings,
    LabelMode,
    LayoutAlgorithm,
    MapColors,
    MarkedPackage,
    MetricsLensSource,
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
    sharedView: SharedView
}

export interface DynamicSettings {
    sortingOption: SortingOption
}

// The cross-renderer view-state home (Slice 8+9b+9c): values that are neither map-specific settings nor
// cc.json source, and that any renderer (CodeMap, Graph, …) shares — the focus stack, the search
// pattern, the blacklist and the marked packages. Slice 8 pulled focus/search out of dynamicSettings;
// Slice 9b pulled the blacklist and Slice 9c the markedPackages out of fileSettings (both scope what
// every renderer shows/highlights, so they are shared view state, not cc.json source). The .cc.json file
// still carries blacklist + markedPackages per-file, so CCFile keeps them (see the intersection on
// CCFile.settings.fileSettings); only the merged STATE root moves here. A later slice grows it further
// (the renderer-agnostic selected-node id in 13).
export interface SharedView {
    focusedNodePath: string[]
    searchPattern: string
    blacklist: BlacklistItem[]
    markedPackages: MarkedPackage[]
}

// The map-view state home (Slice 5+6+7): the purely-visual leaf settings that were
// previously combined under appSettings/dynamicSettings/appStatus now live under
// their own state.mapState root. Slice 6 absorbed the presentation stragglers
// (colorMode/colorRange/margin, layoutAlgorithm/isLoadingMap) and the transient
// interaction ids (hoveredNodeId/rightClickedNodeData/selectedBuildingId). Slice 7
// absorbed the metric SELECTION (the PrimaryMetrics area/height/color/edge + the
// distributionMetric) — the map view's choice of which metric drives each channel.
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
    isLoadingMap: boolean
    hoveredNodeId: number | null
    selectedBuildingId: number | null
    rightClickedNodeData: {
        nodeId: number
        xPositionOfRightClickEvent: number
        yPositionOfRightClickEvent: number
        origin: "codeMap" | "explorer"
    } | null
}

export interface AppSettings {
    isPresentationMode: boolean
    resetCameraIfNewFileIsLoaded: boolean
    isLoadingFile: boolean
    sortingOrderAscending: boolean
    maxTreeMapFiles: number
    experimentalFeaturesEnabled: boolean
    screenshotToClipboardEnabled: boolean
    isColorMetricLinkedToHeightMetric: boolean
}

export interface CcState {
    fileSettings: FileSettings
    metricsLensSource: MetricsLensSource
    dynamicSettings: DynamicSettings
    appSettings: AppSettings
    mapState: MapState
    sharedView: SharedView
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
}
