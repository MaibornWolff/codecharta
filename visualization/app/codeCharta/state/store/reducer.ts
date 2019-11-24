import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import { combineReducers } from "redux"

const rootReducer = combineReducers({
	fileSettings,
	appSettings
})

export default rootReducer
