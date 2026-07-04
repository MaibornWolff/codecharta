import {
    BlacklistItem,
    CCFile,
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    DependencyLensSource,
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

// The durable global-preferences home (Slice 10): the user-level prefs that are neither map-view
// settings, cc.json source, nor cross-renderer view state. Slice 10 dissolved the appSettings and
// dynamicSettings grab-bags into this single home — the seven ex-appSettings prefs plus the
// ex-dynamicSettings sortingOption. Slice 10c merged the two file-explorer sort prefs
// (ex-appSettings sortingOrderAscending + ex-dynamicSettings sortingOption) into one `sorting`
// object. These persist globally (not per-file-set).
export interface Preferences {
    isPresentationMode: boolean
    resetCameraIfNewFileIsLoaded: boolean
    maxTreeMapFiles: number
    experimentalFeaturesEnabled: boolean
    screenshotToClipboardEnabled: boolean
    isColorMetricLinkedToHeightMetric: boolean
    sorting: Sorting
}

// The cross-renderer view-state home (Slice 8+9b+9c): values that are neither map-specific settings nor
// cc.json source, and that any renderer (CodeMap, Graph, …) shares — the focus stack, the search
// pattern, the blacklist and the marked packages. Slice 8 pulled focus/search out of dynamicSettings;
// Slice 9b pulled the blacklist and Slice 9c the markedPackages out of fileSettings (both scope what
// every renderer shows/highlights, so they are shared view state, not cc.json source). The .cc.json file
// still carries blacklist + markedPackages per-file, so CCFile keeps them (see the intersection on
// CCFile.settings.fileSettings); only the merged STATE root moves here. Slice 14e-1 grew it further with
// the renderer-agnostic interaction ids (hoveredNodeId/selectedBuildingId/rightClickedNodeData) — they
// scope what every renderer highlights, so they are shared view state. Slice 14e-2 re-expressed them as
// canonical node PATHs (stable across re-decoration/reload; sha-16 only at the serialization boundary).
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

// The map-view state home (Slice 5+6+7): the purely-visual leaf settings that were
// previously combined under appSettings/dynamicSettings/appStatus now live under
// their own state.mapState root. Slice 6 absorbed the presentation stragglers
// (colorMode/colorRange/margin, layoutAlgorithm/isLoadingMap). The transient interaction
// ids it also absorbed moved on to sharedView in Slice 14e-1. Slice 7
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
}

export interface CcState {
    metricsLensSource: MetricsLensSource
    // The dependency lens's cc.json source root (Slice 14): the edge attribute types, re-homed out of the
    // metrics lens's `metricsLensSource` (where Slice 9a transiently parked them). Twin of metricsLensSource.
    dependencyLensSource: DependencyLensSource
    preferences: Preferences
    mapState: MapState
    sharedView: SharedView
    files: FileState[]
    // fileStore-owned provenance/status flags (Slice 10a): the file-load spinner flag and whether
    // the currently loaded files are the bundled samples. Pulled out of the appSettings/appStatus
    // grab-bags into their own top-level roots, owned by the fileStore that sets them.
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
