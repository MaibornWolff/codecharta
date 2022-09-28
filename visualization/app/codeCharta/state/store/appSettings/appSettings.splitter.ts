import { AppSettings, CCAction, colorLabelOptions, MapColors, RecursivePartial } from "../../../codeCharta.model"
import { Vector3 } from "three"

import { splitColorLabelsAction } from "./colorLabels/colorLabels.splitter"
import { splitShowMetricLabelNodeNameAction } from "./showMetricLabelNodeName/showMetricLabelNodeName.splitter"
import { splitShowMetricLabelNameValueAction } from "./showMetricLabelNameValue/showMetricLabelNameValue.splitter"
import { splitIsAttributeSideBarVisibleAction } from "./isAttributeSideBarVisible/isAttributeSideBarVisible.splitter"
import { splitSortingOrderAscendingAction } from "./sortingOrderAscending/sortingOrderAscending.splitter"
import { splitIsLoadingFileAction } from "./isLoadingFile/isLoadingFile.splitter"
import { splitIsLoadingMapAction } from "./isLoadingMap/isLoadingMap.splitter"
import { splitMapColorsAction } from "./mapColors/mapColors.splitter"
import { splitResetCameraIfNewFileIsLoadedAction } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.splitter"
import { splitShowOnlyBuildingsWithEdgesAction } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.splitter"
import { splitIsWhiteBackgroundAction } from "./isWhiteBackground/isWhiteBackground.splitter"
import { splitDynamicMarginAction } from "./dynamicMargin/dynamicMargin.splitter"
import { splitInvertHeightAction } from "./invertHeight/invertHeight.splitter"
import { splitHideFlatBuildingsAction } from "./hideFlatBuildings/hideFlatBuildings.splitter"
import { splitScalingAction } from "./scaling/scaling.splitter"
import { splitEdgeHeightAction } from "./edgeHeight/edgeHeight.splitter"
import { splitAmountOfEdgePreviewsAction } from "./amountOfEdgePreviews/amountOfEdgePreviews.splitter"
import { splitAmountOfTopLabelsAction } from "./amountOfTopLabels/amountOfTopLabels.splitter"
import { splitIsPresentationModeAction } from "./isPresentationMode/isPresentationMode.splitter"
import { splitExperimentalFeaturesEnabledAction } from "./enableExperimentalFeatures/experimentalFeaturesEnabled.splitter"
import { splitLayoutAlgorithmAction } from "./layoutAlgorithm/layoutAlgorithm.splitter"
import { splitMaxTreeMapFilesAction } from "./maxTreeMapFiles/maxTreeMapFiles.splitter"
import { splitSharpnessAction } from "./sharpnessMode/sharpnessMode.splitter"

export function splitAppSettingsActions(payload: RecursivePartial<AppSettings>) {
	const actions: CCAction[] = []

	if (payload.showMetricLabelNodeName !== undefined) {
		actions.push(splitShowMetricLabelNodeNameAction(payload.showMetricLabelNodeName))
	}

	if (payload.showMetricLabelNameValue !== undefined) {
		actions.push(splitShowMetricLabelNameValueAction(payload.showMetricLabelNameValue))
	}

	if (payload.isAttributeSideBarVisible !== undefined) {
		actions.push(splitIsAttributeSideBarVisibleAction(payload.isAttributeSideBarVisible))
	}

	if (payload.sortingOrderAscending !== undefined) {
		actions.push(splitSortingOrderAscendingAction(payload.sortingOrderAscending))
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

	if (payload.isWhiteBackground !== undefined) {
		actions.push(splitIsWhiteBackgroundAction(payload.isWhiteBackground))
	}

	if (payload.dynamicMargin !== undefined) {
		actions.push(splitDynamicMarginAction(payload.dynamicMargin))
	}

	if (payload.invertHeight !== undefined) {
		actions.push(splitInvertHeightAction(payload.invertHeight))
	}

	if (payload.hideFlatBuildings !== undefined) {
		actions.push(splitHideFlatBuildingsAction(payload.hideFlatBuildings))
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

	if (payload.experimentalFeaturesEnabled !== undefined) {
		actions.push(splitExperimentalFeaturesEnabledAction(payload.experimentalFeaturesEnabled))
	}

	if (payload.layoutAlgorithm !== undefined) {
		actions.push(splitLayoutAlgorithmAction(payload.layoutAlgorithm))
	}

	if (payload.maxTreeMapFiles !== undefined) {
		actions.push(splitMaxTreeMapFilesAction(payload.maxTreeMapFiles))
	}

	if (payload.sharpnessMode !== undefined) {
		actions.push(splitSharpnessAction(payload.sharpnessMode))
	}

	if (payload.colorLabels !== undefined) {
		actions.push(splitColorLabelsAction(payload.colorLabels as colorLabelOptions))
	}

	if (payload.isHeightAndColorMetricCoupled !== undefined) {
		actions.push(splitShowOnlyBuildingsWithEdgesAction(payload.isHeightAndColorMetricCoupled))
	}

	return actions
}
