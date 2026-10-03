import { createSelector } from "@ngrx/store"
import { currentFocusedNodePathSelector } from "../../stores/sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const focusedNodeSelector = createSelector(currentFocusedNodePathSelector, pathToNodeSelector, (focusedNodePath, pathToNode) =>
    focusedNodePath ? pathToNode.get(focusedNodePath) : undefined
)
