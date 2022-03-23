import { combineReducers } from "redux"

import { hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

const appStatus = combineReducers({
	hoveredNodeId,
	selectedBuildingId,
	rightClickedNodeData
})

export default appStatus
