import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../codeCharta.model"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"
import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern,
    blacklist,
    markedPackages,
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    blacklist: defaultBlacklist,
    markedPackages: defaultMarkedPackages,
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData
}
