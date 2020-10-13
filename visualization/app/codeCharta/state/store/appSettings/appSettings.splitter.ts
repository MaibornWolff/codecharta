import { AppSettings, CCAction, MapColors, RecursivePartial } from "../../../codeCharta.model"
import { Vector3 } from "three"

// Plop: Append action splitter import here
import { splitShowMetricLabelNodeNameAction } from "./showMetricLabelNodeName/showMetricLabelNodeName.splitter"
import { splitShowMetricLabelNameValueAction } from "./showMetricLabelNameValue/showMetricLabelNameValue.splitter"
import { splitPanelSelectionAction } from "./panelSelection/panelSelection.splitter"
import { splitCameraTargetAction } from "./cameraTarget/cameraTarget.splitter"
import { splitIsAttributeSideBarVisibleAction } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.splitter"
import { splitSortingOrderAscendingAction } from "./sortingOrderAscending/sortingOrderAscending.splitter"
import { splitSearchPanelModeAction } from "./searchPanelMode/searchPanelMode.splitter"
import { splitIsLoadingFileAction } from "./isLoadingFile/isLoadingFile.splitter"
import { splitIsLoadingMapAction } from "./isLoadingMap/isLoadingMap.splitter"
import { splitMapColorsAction } from "./mapColors/mapColors.splitter"
import { splitResetCameraIfNewFileIsLoadedAction } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.splitter"
import { splitShowOnlyBuildingsWithEdgesAction } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.splitter"
import { splitWhiteColorBuildingsAction } from "./whiteColorBuildings/whiteColorBuildings.splitter"
import { splitIsWhiteBackgroundAction } from "./isWhiteBackground/isWhiteBackground.splitter"
import { splitDynamicMarginAction } from "./dynamicMargin/dynamicMargin.splitter"
import { splitInvertHeightAction } from "./invertHeight/invertHeight.splitter"
import { splitInvertDeltaColorsAction } from "./invertDeltaColors/invertDeltaColors.splitter"
import { splitInvertColorRangeAction } from "./invertColorRange/invertColorRange.splitter"
import { splitHideFlatBuildingsAction } from "./hideFlatBuildings/hideFlatBuildings.splitter"
import { splitCameraAction } from "./camera/camera.splitter"
import { splitScalingAction } from "./scaling/scaling.splitter"
import { splitEdgeHeightAction } from "./edgeHeight/edgeHeight.splitter"
import { splitAmountOfEdgePreviewsAction } from "./amountOfEdgePreviews/amountOfEdgePreviews.splitter"
import { splitAmountOfTopLabelsAction } from "./amountOfTopLabels/amountOfTopLabels.splitter"
import { splitIsPresentationModeAction } from "./isPresentationMode/isPresentationMode.splitter"

export function splitAppSettingsActions(payload: RecursivePartial<AppSettings>) {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.showMetricLabelNodeName !== undefined) {
		actions.push(splitShowMetricLabelNodeNameAction(payload.showMetricLabelNodeName))
	}

	if (payload.showMetricLabelNameValue !== undefined) {
		actions.push(splitShowMetricLabelNameValueAction(payload.showMetricLabelNameValue))
	}

	if (payload.panelSelection !== undefined) {
		actions.push(splitPanelSelectionAction(payload.panelSelection))
	}

	if (payload.cameraTarget !== undefined) {
		actions.push(splitCameraTargetAction(payload.cameraTarget as Vector3))
	}

	if (payload.isAttributeSideBarVisible !== undefined) {
		actions.push(splitIsAttributeSideBarVisibleAction(payload.isAttributeSideBarVisible))
	}

	if (payload.sortingOrderAscending !== undefined) {
		actions.push(splitSortingOrderAscendingAction(payload.sortingOrderAscending))
	}

	if (payload.searchPanelMode !== undefined) {
		actions.push(splitSearchPanelModeAction(payload.searchPanelMode))
	}

	if (payload.isLoadingFile !== undefined) {
		actions.push(splitIsLoadingFileAction(payload.isLoadingFile))
	}

	if (payload.isLoadingMap !== undefined) {
		actions.push(splitIsLoadingMapAction(payload.isLoadingMap))
	}

	if (payload.mapColors !== undefined) {
		actions.push(splitMapColorsAction(payload.mapColors as MapColors))
	}

	if (payload.resetCameraIfNewFileIsLoaded !== undefined) {
		actions.push(splitResetCameraIfNewFileIsLoadedAction(payload.resetCameraIfNewFileIsLoaded))
	}

	if (payload.showOnlyBuildingsWithEdges !== undefined) {
		actions.push(splitShowOnlyBuildingsWithEdgesAction(payload.showOnlyBuildingsWithEdges))
	}

	if (payload.whiteColorBuildings !== undefined) {
		actions.push(splitWhiteColorBuildingsAction(payload.whiteColorBuildings))
	}

	if (payload.isWhiteBackground !== undefined) {
		actions.push(splitIsWhiteBackgroundAction(payload.isWhiteBackground))
	}

	if (payload.dynamicMargin !== undefined) {
		actions.push(splitDynamicMarginAction(payload.dynamicMargin))
	}

	if (payload.invertHeight !== undefined) {
		actions.push(splitInvertHeightAction(payload.invertHeight))
	}

	if (payload.invertDeltaColors !== undefined) {
		actions.push(splitInvertDeltaColorsAction(payload.invertDeltaColors))
	}

	if (payload.invertColorRange !== undefined) {
		actions.push(splitInvertColorRangeAction(payload.invertColorRange))
	}

	if (payload.hideFlatBuildings !== undefined) {
		actions.push(splitHideFlatBuildingsAction(payload.hideFlatBuildings))
	}

	if (payload.camera !== undefined) {
		actions.push(splitCameraAction(payload.camera as Vector3))
	}

	if (payload.scaling !== undefined) {
		actions.push(splitScalingAction(payload.scaling as Vector3))
	}

	if (payload.edgeHeight !== undefined) {
		actions.push(splitEdgeHeightAction(payload.edgeHeight))
	}

	if (payload.amountOfEdgePreviews !== undefined) {
		actions.push(splitAmountOfEdgePreviewsAction(payload.amountOfEdgePreviews))
	}

	if (payload.amountOfTopLabels !== undefined) {
		actions.push(splitAmountOfTopLabelsAction(payload.amountOfTopLabels))
	}

	if (payload.isPresentationMode !== undefined) {
		actions.push(splitIsPresentationModeAction(payload.isPresentationMode))
	}

	return actions
}
