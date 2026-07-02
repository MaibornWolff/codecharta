import {
    amountOfEdgePreviews,
    amountOfTopLabels,
    colorLabels,
    defaultAmountOfEdgesPreviews,
    defaultAmountOfTopLabels,
    defaultColorLabelOptions,
    defaultEdgeHeight,
    defaultEnableFloorLabels,
    defaultGroupLabelCollisions,
    defaultHideFlatBuildings,
    defaultInvertArea,
    defaultInvertHeight,
    defaultIsEdgeMetricVisible,
    defaultIsWhiteBackground,
    defaultLabelMode,
    defaultLabelSize,
    defaultLabelsPerMap,
    defaultMapColors,
    defaultScaling,
    defaultShowIncomingEdges,
    defaultShowMetricLabelNameValue,
    defaultShowMetricLabelNodeName,
    defaultShowOnlyBuildingsWithEdges,
    defaultShowOutgoingEdges,
    edgeHeight,
    enableFloorLabels,
    groupLabelCollisions,
    hideFlatBuildings,
    invertArea,
    invertHeight,
    isEdgeMetricVisible,
    isWhiteBackground,
    labelMode,
    labelSize,
    labelsPerMap,
    mapColors,
    scaling,
    showIncomingEdges,
    showMetricLabelNameValue,
    showMetricLabelNodeName,
    showOnlyBuildingsWithEdges,
    showOutgoingEdges
} from "../../../mapState/mapState.facade"
import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultIsLoadingFile, isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { defaultIsLoadingMap, isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import {
    defaultResetCameraIfNewFileIsLoaded,
    resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import {
    defaultExperimentalFeaturesEnabled,
    experimentalFeaturesEnabled
} from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { defaultLayoutAlgorithm, layoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.reducer"
import { defaultMaxTreeMapFiles, maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { defaultScreenshotToClipboardEnabled, screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import {
    defaultIsColorMetricLinkedToHeightMetric,
    isColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { combineReducers } from "@ngrx/store"

export const appSettings = combineReducers({
    colorLabels,
    showMetricLabelNodeName,
    showMetricLabelNameValue,
    sortingOrderAscending,
    isLoadingFile,
    isLoadingMap,
    mapColors,
    resetCameraIfNewFileIsLoaded,
    showIncomingEdges,
    showOutgoingEdges,
    showOnlyBuildingsWithEdges,
    isEdgeMetricVisible,
    isWhiteBackground,
    invertHeight,
    invertArea,
    hideFlatBuildings,
    scaling,
    edgeHeight,
    amountOfEdgePreviews,
    amountOfTopLabels,
    labelSize,
    isPresentationMode,
    experimentalFeaturesEnabled,
    screenshotToClipboardEnabled,
    layoutAlgorithm,
    maxTreeMapFiles,
    isColorMetricLinkedToHeightMetric,
    enableFloorLabels,
    labelMode,
    groupLabelCollisions,
    labelsPerMap
})

export const defaultAppSettings = {
    colorLabels: defaultColorLabelOptions,
    showMetricLabelNodeName: defaultShowMetricLabelNodeName,
    showMetricLabelNameValue: defaultShowMetricLabelNameValue,
    sortingOrderAscending: defaultSortingOrderAscending,
    isLoadingFile: defaultIsLoadingFile,
    isLoadingMap: defaultIsLoadingMap,
    mapColors: defaultMapColors,
    resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
    showIncomingEdges: defaultShowIncomingEdges,
    showOutgoingEdges: defaultShowOutgoingEdges,
    showOnlyBuildingsWithEdges: defaultShowOnlyBuildingsWithEdges,
    isEdgeMetricVisible: defaultIsEdgeMetricVisible,
    isWhiteBackground: defaultIsWhiteBackground,
    invertHeight: defaultInvertHeight,
    invertArea: defaultInvertArea,
    hideFlatBuildings: defaultHideFlatBuildings,
    scaling: defaultScaling,
    edgeHeight: defaultEdgeHeight,
    amountOfEdgePreviews: defaultAmountOfEdgesPreviews,
    amountOfTopLabels: defaultAmountOfTopLabels,
    labelSize: defaultLabelSize,
    isPresentationMode: defaultIsPresentationMode,
    experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
    screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
    layoutAlgorithm: defaultLayoutAlgorithm,
    maxTreeMapFiles: defaultMaxTreeMapFiles,
    isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric,
    enableFloorLabels: defaultEnableFloorLabels,
    labelMode: defaultLabelMode,
    groupLabelCollisions: defaultGroupLabelCollisions,
    labelsPerMap: defaultLabelsPerMap
}
