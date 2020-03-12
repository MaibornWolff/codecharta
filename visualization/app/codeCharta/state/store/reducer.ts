import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import treeMap from "./treeMap/treeMap.reducer"
import files from "./files/files.reducer"
import { combineReducers } from "redux"

const rootReducer = combineReducers({
	fileSettings,
	appSettings,
	dynamicSettings,
	treeMap,
	files
})

export default rootReducer
