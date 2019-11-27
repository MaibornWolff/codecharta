// Plop: Append reducer import here
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
