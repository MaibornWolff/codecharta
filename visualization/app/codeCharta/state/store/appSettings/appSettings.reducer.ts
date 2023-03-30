import { colorLabels } from "./colorLabels/colorLabels.reducer"
import { showMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.reducer"
import { showMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.reducer"
import { sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import { mapColors } from "./mapColors/mapColors.reducer"
import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
import { isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { invertHeight } from "./invertHeight/invertHeight.reducer"
import { hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { scaling } from "./scaling/scaling.reducer"
import { edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { amountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { experimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { layoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.reducer"
import { maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { sharpnessMode } from "./sharpnessMode/sharpnessMode.reducer"
import { screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import { invertArea } from "./invertArea/invertArea.reducer"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.reducer"
import { isColorMetricLinkedToHeightMetric } from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { enableFloorLabels } from "./enableFloorLabels/enableFloorLabels.reducer"
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
	isPresentationMode,
	experimentalFeaturesEnabled,
	screenshotToClipboardEnabled,
	layoutAlgorithm,
	maxTreeMapFiles,
	sharpnessMode,
	isColorMetricLinkedToHeightMetric,
	enableFloorLabels
})
