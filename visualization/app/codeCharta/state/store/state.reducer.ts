import { combineReducers } from "redux"

import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import files from "./files/files.reducer"
import appStatus from "./appStatus/appStatus.reducer"

const rootReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings,
	files,
	appStatus
})

export default rootReducer
