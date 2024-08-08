import { combineReducers } from "@ngrx/store"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"
import { cameraZoomFactor, defaultCameraZoomFactor } from "./cameraZoomFactor/cameraZoomFactor.reducer"

export const appStatus = combineReducers({
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData,
    cameraZoomFactor
})

export const defaultAppStatus = {
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData,
    cameraZoomFactor: defaultCameraZoomFactor
}
