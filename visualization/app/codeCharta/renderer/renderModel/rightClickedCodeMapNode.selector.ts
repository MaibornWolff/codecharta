import { createSelector } from "@ngrx/store"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"
import { rightClickedNodeDataSelector } from "../../stores/sharedView/sharedView.read.facade"

export const rightClickedCodeMapNodeSelector = createSelector(
    rightClickedNodeDataSelector,
    pathToNodeSelector,
    (rightClickedNodeData, pathToNode) => (rightClickedNodeData ? pathToNode.get(rightClickedNodeData.nodeId) : null)
)
