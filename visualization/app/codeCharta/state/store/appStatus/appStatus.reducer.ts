import { combineReducers } from "@ngrx/store"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

export const appStatus = combineReducers({
	hoveredNodeId,
	selectedBuildingId,
	rightClickedNodeData
})

export const defaultAppStatus = {
	hoveredNodeId: defaultHoveredNodeId,
	selectedBuildingId: defaultSelectedBuildingId,
	rightClickedNodeData: defaultRightClickedNodeData
}
