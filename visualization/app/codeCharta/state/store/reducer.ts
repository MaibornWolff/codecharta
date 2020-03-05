// Plop: Import sub-reducer here
import appSettings from "./appSettings/appSettings.reducer"
import fileSettings from "./fileSettings/fileSettings.reducer"
import dynamicSettings from "./dynamicSettings/dynamicSettings.reducer"
import treeMap from "./treeMap/treeMap.reducer"
import { combineReducers } from "redux"

const rootReducer = combineReducers({
	// Plop: Append sub-reducer here
	fileSettings,
	appSettings,
	dynamicSettings,
	treeMap
})

export default rootReducer
