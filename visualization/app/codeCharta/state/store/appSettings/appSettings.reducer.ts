// Plop: Append reducer import here
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"
import { combineReducers } from "redux"

const appSettings = combineReducers({
	// Plop: Append reducer usage here
	isPresentationMode
})

export default appSettings
