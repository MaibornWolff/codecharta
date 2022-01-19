import { combineReducers } from "redux"

import { hoveredBuildingPath } from "./hoveredBuildingPath/hoveredBuildingPath.reducer"
import { rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

const appStatus = combineReducers({
	hoveredBuildingPath,
	selectedBuildingId,
	rightClickedNodeData
})

export default appStatus
