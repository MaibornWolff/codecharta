import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../../model/codeCharta.model"
import { defaultExcludedNodes, excludedNodes } from "./excludedNodes/excludedNodes.reducer"
import { defaultFlattenedNodes, flattenedNodes } from "./flattenedNodes/flattenedNodes.reducer"
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
    excludedNodes,
    flattenedNodes,
    metricRules,
    markedPackages,
    hoveredNodeId,
    selectedBuildingId,
    rightClickedNodeData
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    excludedNodes: defaultExcludedNodes,
    flattenedNodes: defaultFlattenedNodes,
    metricRules: defaultMetricRules,
    markedPackages: defaultMarkedPackages,
    hoveredNodeId: defaultHoveredNodeId,
    selectedBuildingId: defaultSelectedBuildingId,
    rightClickedNodeData: defaultRightClickedNodeData
}
