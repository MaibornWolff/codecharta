import { createSelector } from "@ngrx/store"
import { selectedNodePathSelector } from "../../stores/sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const selectedNodeSelector = createSelector(selectedNodePathSelector, pathToNodeSelector, (selectedNodePath, pathToNode) =>
    pathToNode?.get(selectedNodePath)
)
