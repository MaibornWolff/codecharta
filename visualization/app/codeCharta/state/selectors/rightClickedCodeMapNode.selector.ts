import { createSelector } from "@ngrx/store"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"
import { rightClickedNodeDataSelector } from "../store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"

export const rightClickedCodeMapNodeSelector = createSelector(
    rightClickedNodeDataSelector,
    idToNodeSelector,
    (rightClickedNodeData, idToNode) => (rightClickedNodeData ? idToNode.get(rightClickedNodeData.nodeId) : null)
)
