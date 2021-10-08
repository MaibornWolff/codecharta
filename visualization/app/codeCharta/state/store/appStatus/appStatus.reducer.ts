import { combineReducers } from "redux"

import { hoveredBuildingPath } from "./hoveredBuildingPath/hoveredBuildingPath.reducer"

const appStatus = combineReducers({
	hoveredBuildingPath
})

export default appStatus
