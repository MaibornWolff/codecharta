import { createSelector } from "@ngrx/store"
import { rightClickedNodeDataSelector } from "../../stores/sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const rightClickedCodeMapNodeSelector = createSelector(
    rightClickedNodeDataSelector,
    pathToNodeSelector,
    (rightClickedNodeData, pathToNode) => (rightClickedNodeData ? pathToNode.get(rightClickedNodeData.nodeId) : null)
)
