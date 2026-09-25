import { combineReducers } from "@ngrx/store"
import { SharedView } from "../../../model/codeCharta.model"
import { defaultExcludedNodes, excludedNodes } from "./excludedNodes/excludedNodes.reducer"
import { defaultFlattenedNodes, flattenedNodes } from "./flattenedNodes/flattenedNodes.reducer"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultHoveredFileExtensions, hoveredFileExtensions } from "./hoveredFileExtensions/hoveredFileExtensions.reducer"
import { defaultHoveredNodePath, hoveredNodePath } from "./hoveredNodePath/hoveredNodePath.reducer"
import { defaultKeptHighlightPaths, keptHighlightPaths } from "./keptHighlightPaths/keptHighlightPaths.reducer"
import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultMetricRules, metricRules } from "./metricRules/metricRules.reducer"
import { defaultRightClickedNodeData, rightClickedNodeData } from "./rightClickedNodeData/rightClickedNodeData.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { defaultSelectedNodePath, selectedNodePath } from "./selectedNodePath/selectedNodePath.reducer"

export const sharedView = combineReducers({
    focusedNodePath,
    searchPattern,
    excludedNodes,
    flattenedNodes,
    metricRules,
    markedPackages,
    hoveredNodePath,
    hoveredFileExtensions,
    keptHighlightPaths,
    selectedNodePath,
    rightClickedNodeData
})

export const defaultSharedView: SharedView = {
    focusedNodePath: defaultFocusedNodePath,
    searchPattern: defaultSearchPattern,
    excludedNodes: defaultExcludedNodes,
    flattenedNodes: defaultFlattenedNodes,
    metricRules: defaultMetricRules,
    markedPackages: defaultMarkedPackages,
    hoveredNodePath: defaultHoveredNodePath,
    hoveredFileExtensions: defaultHoveredFileExtensions,
    keptHighlightPaths: defaultKeptHighlightPaths,
    selectedNodePath: defaultSelectedNodePath,
    rightClickedNodeData: defaultRightClickedNodeData
}
