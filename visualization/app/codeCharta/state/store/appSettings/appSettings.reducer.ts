// Plop: Append reducer import here
import { scaling } from "./scaling/scaling.reducer"
import { edgeHeight } from "./edgeHeight/edgeHeight.reducer"
import { amountOfEdgePreviews } from "./amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { amountOfTopLabels } from "./amountOfTopLabels/amountOfTopLabels.reducer"
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { combineReducers } from "redux"

const appSettings = combineReducers({
	// Plop: Append reducer usage here
	scaling,
	edgeHeight,
	amountOfEdgePreviews,
	amountOfTopLabels,
	isPresentationMode
})

export default appSettings
