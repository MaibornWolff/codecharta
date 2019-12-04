// Plop: Append reducer import here
import { mapColors } from "./mapColors/mapColors.reducer"
import { resetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.reducer"
import { showOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.reducer"
import { whiteColorBuildings } from "./whiteColorBuildings/whiteColorBuildings.reducer"
import { isWhiteBackground } from "./isWhiteBackground/isWhiteBackground.reducer"
import { dynamicMargin } from "./dynamicMargin/dynamicMargin.reducer"
import { invertHeight } from "./invertHeight/invertHeight.reducer"
import { invertDeltaColors } from "./invertDeltaColors/invertDeltaColors.reducer"
import { invertColorRange } from "./invertColorRange/invertColorRange.reducer"
import { hideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.reducer"
import { camera } from "./camera/camera.reducer"
import { scaling } from "./scaling/scaling.reducer"
import { edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { amountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { AppSettings, CCAction } from "../../../codeCharta.model"
import { AppSettingsActions } from "./appSettings.actions"
import { setMapColors } from "./mapColors/mapColors.actions"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { setWhiteColorBuildings } from "./whiteColorBuildings/whiteColorBuildings.actions"
import { setIsWhiteBackground } from "./isWhiteBackground/isWhiteBackground.actions"
import { setDynamicMargin } from "./dynamicMargin/dynamicMargin.actions"
import { setInvertHeight } from "./invertHeight/invertHeight.actions"
import { setInvertDeltaColors } from "./invertDeltaColors/invertDeltaColors.actions"
import { setInvertColorRange } from "./invertColorRange/invertColorRange.actions"
import { setHideFlatBuildings } from "./hideFlatBuildings/hideFlatBuildings.actions"
import { setCamera } from "./camera/camera.actions"
import { setScaling } from "./scaling/scaling.actions"
import { setEdgeHeight } from "./edgeHeight/edgeHeight.actions"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { setAmountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.actions"
import { setPresentationMode } from "./isPresentationMode/isPresentationMode.actions"

export default function appSettings(state: AppSettings = {} as AppSettings, action: CCAction): AppSettings {
	// Plop: Append action declaration here
	let mapColorsAction = action
	let resetCameraIfNewFileIsLoadedAction = action
	let showOnlyBuildingsWithEdgesAction = action
	let whiteColorBuildingsAction = action
	let isWhiteBackgroundAction = action
	let dynamicMarginAction = action
	let invertHeightAction = action
	let invertDeltaColorsAction = action
	let invertColorRangeAction = action
	let hideFlatBuildingsAction = action
	let cameraAction = action
	let scalingAction = action
	let edgeHeightAction = action
	let amountOfEdgePreviewsAction = action
	let amountOfTopLabelsAction = action
	let isPresentationModeAction = action

	if (action && action.type === AppSettingsActions.SET_APP_SETTINGS) {
		// Plop: Append check for action payload here
		if (action.payload.mapColors !== undefined) {
			mapColorsAction = setMapColors(action.payload.mapColors)
		}

		if (action.payload.resetCameraIfNewFileIsLoaded !== undefined) {
			resetCameraIfNewFileIsLoadedAction = setResetCameraIfNewFileIsLoaded(action.payload.resetCameraIfNewFileIsLoaded)
		}

		if (action.payload.showOnlyBuildingsWithEdges !== undefined) {
			showOnlyBuildingsWithEdgesAction = setShowOnlyBuildingsWithEdges(action.payload.showOnlyBuildingsWithEdges)
		}

		if (action.payload.whiteColorBuildings !== undefined) {
			whiteColorBuildingsAction = setWhiteColorBuildings(action.payload.whiteColorBuildings)
		}

		if (action.payload.isWhiteBackground !== undefined) {
			isWhiteBackgroundAction = setIsWhiteBackground(action.payload.isWhiteBackground)
		}

		if (action.payload.dynamicMargin !== undefined) {
			dynamicMarginAction = setDynamicMargin(action.payload.dynamicMargin)
		}

		if (action.payload.invertHeight !== undefined) {
			invertHeightAction = setInvertHeight(action.payload.invertHeight)
		}

		if (action.payload.invertDeltaColors !== undefined) {
			invertDeltaColorsAction = setInvertDeltaColors(action.payload.invertDeltaColors)
		}

		if (action.payload.invertColorRange !== undefined) {
			invertColorRangeAction = setInvertColorRange(action.payload.invertColorRange)
		}

		if (action.payload.hideFlatBuildings !== undefined) {
			hideFlatBuildingsAction = setHideFlatBuildings(action.payload.hideFlatBuildings)
		}

		if (action.payload.camera !== undefined) {
			cameraAction = setCamera(action.payload.camera)
		}

		if (action.payload.scaling !== undefined) {
			scalingAction = setScaling(action.payload.scaling)
		}

		if (action.payload.edgeHeight !== undefined) {
			edgeHeightAction = setEdgeHeight(action.payload.edgeHeight)
		}

		if (action.payload.amountOfEdgePreviews !== undefined) {
			amountOfEdgePreviewsAction = setAmountOfEdgePreviews(action.payload.amountOfEdgePreviews)
		}

		if (action.payload.amountOfTopLabels !== undefined) {
			amountOfTopLabelsAction = setAmountOfTopLabels(action.payload.amountOfTopLabels)
		}

		if (action.payload.isPresentationMode !== undefined) {
			isPresentationModeAction = setPresentationMode(action.payload.isPresentationMode)
		}
	}

	return {
		// Plop: Append action forwarding here
		mapColors: mapColors(state.mapColors, mapColorsAction),
		resetCameraIfNewFileIsLoaded: resetCameraIfNewFileIsLoaded(state.resetCameraIfNewFileIsLoaded, resetCameraIfNewFileIsLoadedAction),
		showOnlyBuildingsWithEdges: showOnlyBuildingsWithEdges(state.showOnlyBuildingsWithEdges, showOnlyBuildingsWithEdgesAction),
		whiteColorBuildings: whiteColorBuildings(state.whiteColorBuildings, whiteColorBuildingsAction),
		isWhiteBackground: isWhiteBackground(state.isWhiteBackground, isWhiteBackgroundAction),
		dynamicMargin: dynamicMargin(state.dynamicMargin, dynamicMarginAction),
		invertHeight: invertHeight(state.invertHeight, invertHeightAction),
		invertDeltaColors: invertDeltaColors(state.invertDeltaColors, invertDeltaColorsAction),
		invertColorRange: invertColorRange(state.invertColorRange, invertColorRangeAction),
		hideFlatBuildings: hideFlatBuildings(state.hideFlatBuildings, hideFlatBuildingsAction),
		camera: camera(state.camera, cameraAction),
		scaling: scaling(state.scaling, scalingAction),
		edgeHeight: edgeHeight(state.edgeHeight, edgeHeightAction),
		amountOfEdgePreviews: amountOfEdgePreviews(state.amountOfEdgePreviews, amountOfEdgePreviewsAction),
		amountOfTopLabels: amountOfTopLabels(state.amountOfTopLabels, amountOfTopLabelsAction),
		isPresentationMode: isPresentationMode(state.isPresentationMode, isPresentationModeAction)
	}
}
