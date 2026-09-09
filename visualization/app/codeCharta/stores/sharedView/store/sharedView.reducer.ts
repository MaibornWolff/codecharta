import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../../model/codeCharta.model"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultHoveredNodeId, hoveredNodeId } from "./hoveredNodeId/hoveredNodeId.reducer"
import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultMetricRules, metricRules } from "./metricRules/metricRules.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { defaultSelectedBuildingId, selectedBuildingId } from "./selectedBuildingId/selectedBuildingId.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern,
    blacklist,
    metricRules,
    markedPackages,
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    blacklist: defaultBlacklist,
    metricRules: defaultMetricRules,
    markedPackages: defaultMarkedPackages,
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData
}
