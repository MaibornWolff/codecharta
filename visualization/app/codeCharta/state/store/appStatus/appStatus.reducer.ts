import { combineReducers } from "@ngrx/store"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"
import {
    defaultCurrentFilesAreSampleFiles,
    currentFilesAreSampleFiles
} from "./currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"

export const appStatus = combineReducers({
    currentFilesAreSampleFiles,
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData
})

export const defaultAppStatus = {
    currentFilesAreSampleFiles: defaultCurrentFilesAreSampleFiles,
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData
}
