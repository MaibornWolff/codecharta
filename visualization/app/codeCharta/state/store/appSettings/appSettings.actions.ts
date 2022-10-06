import { AppSettings, CCAction, RecursivePartial } from "../../../codeCharta.model"

import { defaultColorLabels } from "./colorLabels/colorLabels.actions"
import { defaultShowMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { defaultShowMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { defaultIsAttributeSideBarVisible } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { defaultAmountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { defaultAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.actions"
import { defaultEdgeHeight } from "./edgeHeight/edgeHeight.actions"
import { defaultScaling } from "./scaling/scaling.actions"
import { defaultHideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.actions"
import { defaultInvertHeight } from "./invertHeight/invertHeight.actions"
import { defaultDynamicMargin } from "./dynamicMargin/dynamicMargin.actions"
import { defaultIsWhiteBackground } from "./isWhiteBackground/isWhiteBackground.actions"
import { defaultMapColors } from "./mapColors/mapColors.actions"
import { defaultIsPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { defaultShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { defaultResetIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { defaultIsLoadingMap } from "./isLoadingMap/isLoadingMap.actions"
import { defaultIsLoadingFile } from "./isLoadingFile/isLoadingFile.actions"
import { defaultSortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.actions"
import { defaultExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { defaultLayoutAlgorithm } from "./layoutAlgorithm/layoutAlgorithm.actions"
import { defaultMaxTreeMapFiles } from "./maxTreeMapFiles/maxTreeMapFiles.actions"
import { defaultSharpnessMode } from "./sharpnessMode/sharpnessMode.actions"
import { defaultScreenshotToClipboardEnabled } from "./enableClipboard/screenshotToClipboardEnabled.actions"
import { defaultInvertArea } from "./invertArea/invertArea.actions"
import { defaultIsEdgeMetricVisible } from "./isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { defaultIsColorMetricLinkedToHeightMetric } from "./isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetricActions"

export enum AppSettingsActions {
	SET_APP_SETTINGS = "SET_APP_SETTINGS"
}

export interface SetAppSettingsAction extends CCAction {
	type: AppSettingsActions.SET_APP_SETTINGS
	payload: RecursivePartial<AppSettings>
}

export type AppSettingsAction = SetAppSettingsAction

export function setAppSettings(appSettings: RecursivePartial<AppSettings> = defaultAppSettings): AppSettingsAction {
	return {
		type: AppSettingsActions.SET_APP_SETTINGS,
		payload: appSettings
	}
}

export const defaultAppSettings: AppSettings = {
	colorLabels: defaultColorLabels,
	showMetricLabelNodeName: defaultShowMetricLabelNodeName,
	showMetricLabelNameValue: defaultShowMetricLabelNameValue,
	isAttributeSideBarVisible: defaultIsAttributeSideBarVisible,
	amountOfTopLabels: defaultAmountOfTopLabels,
	amountOfEdgePreviews: defaultAmountOfEdgePreviews,
	edgeHeight: defaultEdgeHeight,
	scaling: defaultScaling,
	hideFlatBuildings: defaultHideFlatBuildings,
	invertHeight: defaultInvertHeight,
	invertArea: defaultInvertArea,
	dynamicMargin: defaultDynamicMargin,
	isWhiteBackground: defaultIsWhiteBackground,
	mapColors: defaultMapColors,
	isPresentationMode: defaultIsPresentationMode,
	showOnlyBuildingsWithEdges: defaultShowOnlyBuildingsWithEdges,
	isEdgeMetricVisible: defaultIsEdgeMetricVisible,
	resetCameraIfNewFileIsLoaded: defaultResetIfNewFileIsLoaded,
	isLoadingMap: defaultIsLoadingMap,
	isLoadingFile: defaultIsLoadingFile,
	sortingOrderAscending: defaultSortingOrderAscending,
	experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled,
	screenshotToClipboardEnabled: defaultScreenshotToClipboardEnabled,
	layoutAlgorithm: defaultLayoutAlgorithm,
	maxTreeMapFiles: defaultMaxTreeMapFiles,
	sharpnessMode: defaultSharpnessMode,
	isHeightAndColorMetricLinked: defaultIsColorMetricLinkedToHeightMetric
}
