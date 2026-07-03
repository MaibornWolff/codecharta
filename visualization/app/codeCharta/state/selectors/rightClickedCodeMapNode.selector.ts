import { createSelector } from "@ngrx/store"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"
import { rightClickedNodeDataSelector } from "../../sharedView/sharedView.read.facade"

export const rightClickedCodeMapNodeSelector = createSelector(
    rightClickedNodeDataSelector,
    idToNodeSelector,
    (rightClickedNodeData, idToNode) => (rightClickedNodeData ? idToNode.get(rightClickedNodeData.nodeId) : null)
)
