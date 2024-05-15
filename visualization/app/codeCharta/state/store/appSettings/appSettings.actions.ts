import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { setAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.actions"
import { setColorLabels } from "./colorLabels/colorLabels.actions"
import { setEdgeHeight } from "./edgeHeight/edgeHeight.actions"
import { setScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import { setExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setEnableFloorLabels } from "./enableFloorLabels/enableFloorLabels.actions"
import { setHideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.actions"
import { setInvertArea } from "./invertArea/invertArea.actions"
import { setInvertHeight } from "./invertHeight/invertHeight.actions"
import { setIsEdgeMetricVisible, toggleEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.actions"
import {
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { setIsSearchPanelPinned, toggleIsSearchPanelPinned } from "./isSearchPanelPinned/isSearchPanelPinned.actions"
import { setIsWhiteBackground } from "./isWhiteBackground/isWhiteBackground.actions"
import { setLayoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.actions"
import { setMapColors, invertColorRange, invertDeltaColors } from "./mapColors/mapColors.actions"
import { setMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setScaling } from "./scaling/scaling.actions"
import { setSharpnessMode } from "./sharpnessMode/sharpnessMode.actions"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.actions"

export const appSettingsActions = [
    setColorLabels,
    setShowMetricLabelNodeName,
    setShowMetricLabelNameValue,
    setSortingOrderAscending,
    toggleSortingOrderAscending,
    setIsSearchPanelPinned,
    toggleIsSearchPanelPinned,
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
    setPresentationMode,
    setExperimentalFeaturesEnabled,
    setScreenshotToClipboardEnabled,
    setLayoutAlgorithm,
    setMaxTreeMapFiles,
    setSharpnessMode,
    setIsColorMetricLinkedToHeightMetricAction,
    toggleIsColorMetricLinkedToHeightMetric,
    setEnableFloorLabels
]
