import { colorLabels } from "./colorLabels/colorLabels.reducer"
import { showMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.reducer"
import { showMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.reducer"
import { isAttributeSideBarVisible } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.reducer"
import { sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import { mapColors } from "./mapColors/mapColors.reducer"
import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
import { isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { dynamicMargin } from "./dynamicMargin/dynamicMargin.reducer"
import { invertHeight } from "./invertHeight/invertHeight.reducer"
import { hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { scaling } from "./scaling/scaling.reducer"
import { edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { amountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { combineReducers } from "redux"
import { experimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { layoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.reducer"
import { maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { sharpnessMode } from "./sharpnessMode/sharpnessMode.reducer"
import { screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import { invertArea } from "./invertArea/invertArea.reducer"
import { isEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.reducer"
import { isHeightAndColorMetricLinked } from "./isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.reducer"

const appSettings = combineReducers({
	colorLabels,
	showMetricLabelNodeName,
	showMetricLabelNameValue,
	isAttributeSideBarVisible,
	sortingOrderAscending,
	isLoadingFile,
	isLoadingMap,
	mapColors,
	resetCameraIfNewFileIsLoaded,
	showOnlyBuildingsWithEdges,
	isEdgeMetricVisible,
	isWhiteBackground,
	dynamicMargin,
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
	isHeightAndColorMetricLinked
})

export default appSettings
