import { AppSettings, CCAction, MapColors, RecursivePartial } from "../../../model/codeCharta.model"

// Plop: Append action splitter import here
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

export function splitAppSettingsActions(payload: RecursivePartial<AppSettings>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
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
		actions.push(splitCameraAction(payload.camera))
	}

	if (payload.scaling !== undefined) {
		actions.push(splitScalingAction(payload.scaling))
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
