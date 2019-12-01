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
	switch (action.type) {
		case AppSettingsActions.SET_APP_SETTINGS:
			return {
				mapColors: mapColors(state.mapColors, setMapColors(action.payload.mapColors)),
				resetCameraIfNewFileIsLoaded: resetCameraIfNewFileIsLoaded(
					state.resetCameraIfNewFileIsLoaded,
					setResetCameraIfNewFileIsLoaded(action.payload.resetCameraIfNewFileIsLoaded)
				),
				showOnlyBuildingsWithEdges: showOnlyBuildingsWithEdges(
					state.showOnlyBuildingsWithEdges,
					setShowOnlyBuildingsWithEdges(action.payload.showOnlyBuildingsWithEdges)
				),
				whiteColorBuildings: whiteColorBuildings(
					state.whiteColorBuildings,
					setWhiteColorBuildings(action.payload.whiteColorBuildings)
				),
				isWhiteBackground: isWhiteBackground(state.isWhiteBackground, setIsWhiteBackground(action.payload.isWhiteBackground)),
				dynamicMargin: dynamicMargin(state.dynamicMargin, setDynamicMargin(action.payload.dynamicMargin)),
				invertHeight: invertHeight(state.invertHeight, setInvertHeight(action.payload.invertHeight)),
				invertDeltaColors: invertDeltaColors(state.invertDeltaColors, setInvertDeltaColors(action.payload.invertDeltaColors)),
				invertColorRange: invertColorRange(state.invertColorRange, setInvertColorRange(action.payload.invertColorRange)),
				hideFlatBuildings: hideFlatBuildings(state.hideFlatBuildings, setHideFlatBuildings(action.payload.hideFlatBuildings)),
				camera: camera(state.camera, setCamera(action.payload.camera)),
				scaling: scaling(state.scaling, setScaling(action.payload.scaling)),
				edgeHeight: edgeHeight(state.edgeHeight, setEdgeHeight(action.payload.edgeHeight)),
				amountOfEdgePreviews: amountOfEdgePreviews(
					state.amountOfEdgePreviews,
					setAmountOfEdgePreviews(action.payload.amountOfEdgePreviews)
				),
				amountOfTopLabels: amountOfTopLabels(state.amountOfTopLabels, setAmountOfTopLabels(action.payload.amountOfTopLabels)),
				isPresentationMode: isPresentationMode(state.isPresentationMode, setPresentationMode(action.payload.isPresentationMode))
			}
		default:
			return {
				mapColors: mapColors(state.mapColors, action),
				resetCameraIfNewFileIsLoaded: resetCameraIfNewFileIsLoaded(state.resetCameraIfNewFileIsLoaded, action),
				showOnlyBuildingsWithEdges: showOnlyBuildingsWithEdges(state.showOnlyBuildingsWithEdges, action),
				whiteColorBuildings: whiteColorBuildings(state.whiteColorBuildings, action),
				isWhiteBackground: isWhiteBackground(state.isWhiteBackground, action),
				dynamicMargin: dynamicMargin(state.dynamicMargin, action),
				invertHeight: invertHeight(state.invertHeight, action),
				invertDeltaColors: invertDeltaColors(state.invertDeltaColors, action),
				invertColorRange: invertColorRange(state.invertColorRange, action),
				hideFlatBuildings: hideFlatBuildings(state.hideFlatBuildings, action),
				camera: camera(state.camera, action),
				scaling: scaling(state.scaling, action),
				edgeHeight: edgeHeight(state.edgeHeight, action),
				amountOfEdgePreviews: amountOfEdgePreviews(state.amountOfEdgePreviews, action),
				amountOfTopLabels: amountOfTopLabels(state.amountOfTopLabels, action),
				isPresentationMode: isPresentationMode(state.isPresentationMode, action)
			}
	}
}
