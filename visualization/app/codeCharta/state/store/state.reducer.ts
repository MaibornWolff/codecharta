import { combineReducers } from "redux"

import lookUp from "./lookUp/lookUp.reducer"
import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import treeMap from "./treeMap/treeMap.reducer"
import files from "./files/files.reducer"
import appStatus from "./appStatus/appStatus.reducer"

const rootReducer = combineReducers({
	lookUp,
	fileSettings,
	appSettings,
	dynamicSettings,
	treeMap,
	files,
	appStatus
})

export default rootReducer
