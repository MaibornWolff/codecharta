import {
    invertColorRange,
    invertDeltaColors,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setColorLabels,
    setEdgeHeight,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setHideFlatBuildings,
    setInvertArea,
    setInvertHeight,
    setIsEdgeMetricVisible,
    setIsWhiteBackground,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setMapColors,
    setScaling,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName,
    setShowOnlyBuildingsWithEdges,
    toggleEdgeMetricVisible
} from "../../../mapState/mapState.facade"
import { setScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { setLayoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.actions"

export const appSettingsActions = [
    setColorLabels,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setSortingOrderAscending,
    toggleSortingOrderAscending,
    setMapColors,
    invertColorRange,
    invertDeltaColors,
    setResetCameraIfNewFileIsLoaded,
    setShowOnlyBuildingsWithEdges,
    setIsEdgeMetricVisible,
    toggleEdgeMetricVisible,
    setIsWhiteBackground,
    setInvertHeight,
    setInvertArea,
    setHideFlatBuildings,
    setScaling,
    setEdgeHeight,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setLabelSize,
    setPresentationMode,
    setExperimentalFeaturesEnabled,
    setScreenshotToClipboardEnabled,
    setLayoutAlgorithm,
    setMaxTreeMapFiles,
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric,
    setEnableFloorLabels,
    setLabelMode,
    setGroupLabelCollisions,
    setLabelsPerMap
]
