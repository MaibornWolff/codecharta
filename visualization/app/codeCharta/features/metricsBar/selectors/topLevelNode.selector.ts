import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector, pathToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"

export const topLevelNodeSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath) => (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
)
