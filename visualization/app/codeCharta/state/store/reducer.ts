import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import { combineReducers } from "redux"

const rootReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings
})

export default rootReducer
