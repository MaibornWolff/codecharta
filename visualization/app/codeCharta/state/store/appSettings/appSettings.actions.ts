import { AppSettings, CCAction, RecursivePartial } from "../../../codeCharta.model"

// Plop: Append default property import here
import { defaultShowMetricLabelNodeName } from "./showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { defaultShowMetricLabelNameValue } from "./showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { defaultPanelSelection } from "./panelSelection/panelSelection.actions"
import { defaultIsAttributeSideBarVisible } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { defaultAmountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { defaultAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.actions"
import { defaultEdgeHeight } from "./edgeHeight/edgeHeight.actions"
import { defaultScaling } from "./scaling/scaling.actions"
import { defaultCamera } from "./camera/camera.actions"
import { defaultHideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.actions"
import { defaultInvertColorRange } from "./invertColorRange/invertColorRange.actions"
import { defaultInvertDeltaColors } from "./invertDeltaColors/invertDeltaColors.actions"
import { defaultInvertHeight } from "./invertHeight/invertHeight.actions"
import { defaultDynamicMargin } from "./dynamicMargin/dynamicMargin.actions"
import { defaultIsWhiteBackground } from "./isWhiteBackground/isWhiteBackground.actions"
import { defaultWhiteColorBuildings } from "./whiteColorBuildings/whiteColorBuildings.actions"
import { defaultMapColors } from "./mapColors/mapColors.actions"
import { defaultIsPresentationMode } from "./isPresentationMode/isPresentationMode.actions"
import { defaultShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { defaultResetIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { defaultIsLoadingMap } from "./isLoadingMap/isLoadingMap.actions"
import { defaultIsLoadingFile } from "./isLoadingFile/isLoadingFile.actions"
import { defaultSortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.actions"
import { defaultSearchPanelMode } from "./searchPanelMode/searchPanelMode.actions"
import { defaultCameraTarget } from "./cameraTarget/cameraTarget.actions"
import { defaultExperimentalFeaturesEnabled } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.actions"

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
	// Plop: Append default property here
	showMetricLabelNodeName: defaultShowMetricLabelNodeName,
	showMetricLabelNameValue: defaultShowMetricLabelNameValue,
	panelSelection: defaultPanelSelection,
	isAttributeSideBarVisible: defaultIsAttributeSideBarVisible,
	amountOfTopLabels: defaultAmountOfTopLabels,
	amountOfEdgePreviews: defaultAmountOfEdgePreviews,
	edgeHeight: defaultEdgeHeight,
	scaling: defaultScaling,
	camera: defaultCamera,
	cameraTarget: defaultCameraTarget,
	hideFlatBuildings: defaultHideFlatBuildings,
	invertColorRange: defaultInvertColorRange,
	invertDeltaColors: defaultInvertDeltaColors,
	invertHeight: defaultInvertHeight,
	dynamicMargin: defaultDynamicMargin,
	isWhiteBackground: defaultIsWhiteBackground,
	whiteColorBuildings: defaultWhiteColorBuildings,
	mapColors: defaultMapColors,
	isPresentationMode: defaultIsPresentationMode,
	showOnlyBuildingsWithEdges: defaultShowOnlyBuildingsWithEdges,
	resetCameraIfNewFileIsLoaded: defaultResetIfNewFileIsLoaded,
	isLoadingMap: defaultIsLoadingMap,
	isLoadingFile: defaultIsLoadingFile,
	searchPanelMode: defaultSearchPanelMode,
	sortingOrderAscending: defaultSortingOrderAscending,
	experimentalFeaturesEnabled: defaultExperimentalFeaturesEnabled
}
