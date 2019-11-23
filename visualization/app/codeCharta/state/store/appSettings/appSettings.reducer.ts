import { combineReducers } from "redux"
import { isPresentationMode } from "./isPresentationMode/isPresentationMode.reducer"

const appSettings = combineReducers({
	isPresentationMode
})

export default appSettings
