import { combineReducers } from "redux"

import { hoveredBuildingPath } from "./hoveredBuildingPath/hoveredBuildingPath.reducer"
import { selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

const appStatus = combineReducers({
	hoveredBuildingPath,
	selectedBuildingId
})

export default appStatus
