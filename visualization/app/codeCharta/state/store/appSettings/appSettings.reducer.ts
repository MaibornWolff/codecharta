// Plop: Append reducer import here
import { secondaryMetrics } from "./secondaryMetrics/secondaryMetrics.reducer"
import { colorLabels } from "./colorLabels/colorLabels.reducer"
import { showMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.reducer"
import { showMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.reducer"
import { panelSelection } from "./panelSelection/panelSelection.reducer"
import { cameraTarget } from "./cameraTarget/cameraTarget.reducer"
import { isAttributeSideBarVisible } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.reducer"
import { sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { searchPanelMode } from "./searchPanelMode/searchPanelMode.reducer"
import { isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import { mapColors } from "./mapColors/mapColors.reducer"
import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
import { isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { dynamicMargin } from "./dynamicMargin/dynamicMargin.reducer"
import { invertHeight } from "./invertHeight/invertHeight.reducer"
import { hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { camera } from "./camera/camera.reducer"
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

const appSettings = combineReducers({
	// Plop: Append sub-reducer here
	secondaryMetrics,
	colorLabels,
	showMetricLabelNodeName,
	showMetricLabelNameValue,
	panelSelection,
	cameraTarget,
	isAttributeSideBarVisible,
	sortingOrderAscending,
	searchPanelMode,
	isLoadingFile,
	isLoadingMap,
	mapColors,
	resetCameraIfNewFileIsLoaded,
	showOnlyBuildingsWithEdges,
	isWhiteBackground,
	dynamicMargin,
	invertHeight,
	hideFlatBuildings,
	camera,
	scaling,
	edgeHeight,
	amountOfEdgePreviews,
	amountOfTopLabels,
	isPresentationMode,
	experimentalFeaturesEnabled,
	layoutAlgorithm,
	maxTreeMapFiles,
	sharpnessMode
})

export default appSettings
