import { combineReducers } from "@ngrx/store"
import { hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

export const appStatus = combineReducers({
	hoveredNodeId,
	selectedBuildingId,
	rightClickedNodeData
})
