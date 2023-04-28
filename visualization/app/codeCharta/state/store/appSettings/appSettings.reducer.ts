import { colorLabels, defaultColorLabelOptions } from "./colorLabels/colorLabels.reducer"
import { defaultShowMetricLabelNodeName, showMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.reducer"
import { defaultShowMetricLabelNameValue, showMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.reducer"
import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultIsLoadingFile, isLoadingFile } from "./isLoadingFile/isLoadingFile.reducer"
import { defaultIsLoadingMap, isLoadingMap } from "./isLoadingMap/isLoadingMap.reducer"
import { defaultMapColors, mapColors } from "./mapColors/mapColors.reducer"
import {
	defaultResetCameraIfNewFileIsLoaded,
	resetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import {
	defaultShowOnlyBuildingsWithEdges,
	showOnlyBuildingsWithEdges
} from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
import { defaultIsWhiteBackground, isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { defaultInvertHeight, invertHeight } from "./invertHeight/invertHeight.reducer"
import { defaultHideFlatBuildings, hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { defaultScaling, scaling } from "./scaling/scaling.reducer"
import { defaultEdgeHeight, edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { amountOfEdgePreviews, defaultAmountOfEdgesPreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels, defaultAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { defaultIsPresentationMode, isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import {
	defaultExperimentalFeaturesEnabled,
	experimentalFeaturesEnabled
} from "./enableExperimentalFeatures/experimentalFeaturesEnabled.reducer"
import { defaultLayoutAlgorithm, layoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.reducer"
import { defaultMaxTreeMapFiles, maxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.reducer"
import { defaultSharpnessMode, sharpnessMode } from "./sharpnessMode/sharpnessMode.reducer"
import { defaultScreenshotToClipboardEnabled, screenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.reducer"
import { defaultInvertArea, invertArea } from "./invertArea/invertArea.reducer"
import { defaultIsEdgeMetricVisible, isEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.reducer"
import {
	defaultIsColorMetricLinkedToHeightMetric,
	isColorMetricLinkedToHeightMetric
} from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.reducer"
import { defaultEnableFloorLabels, enableFloorLabels } from "./enableFloorLabels/enableFloorLabels.reducer"
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

export const defaultAppSettings = {
	colorLabels: defaultColorLabelOptions,
	showMetricLabelNodeName: defaultShowMetricLabelNodeName,
	showMetricLabelNameValue: defaultShowMetricLabelNameValue,
	sortingOrderAscending: defaultSortingOrderAscending,
	isLoadingFile: defaultIsLoadingFile,
	isLoadingMap: defaultIsLoadingMap,
	mapColors: defaultMapColors,
	resetCameraIfNewFileIsLoaded: defaultResetCameraIfNewFileIsLoaded,
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
	isPresentationMode: defaultIsPresentationMode,
	experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
	screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
	layoutAlgorithm: defaultLayoutAlgorithm,
	maxTreeMapFiles: defaultMaxTreeMapFiles,
	sharpnessMode: defaultSharpnessMode,
	isColorMetricLinkedToHeightMetric: defaultIsColorMetricLinkedToHeightMetric,
	enableFloorLabels: defaultEnableFloorLabels
}
