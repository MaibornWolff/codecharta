// Plop: Append reducer import here
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
import { combineReducers } from "redux"

const appSettings = combineReducers({
	// Plop: Append reducer usage here
	resetCameraIfNewFileIsLoaded,
	showOnlyBuildingsWithEdges,
	whiteColorBuildings,
	isWhiteBackground,
	dynamicMargin,
	invertHeight,
	invertDeltaColors,
	invertColorRange,
	hideFlatBuildings,
	camera,
	scaling,
	edgeHeight,
	amountOfEdgePreviews,
	amountOfTopLabels,
	isPresentationMode
})

export default appSettings
