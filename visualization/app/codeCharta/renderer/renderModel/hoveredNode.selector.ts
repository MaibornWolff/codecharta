import { createSelector } from "@ngrx/store"
import { hoveredNodePathSelector } from "../../stores/sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const hoveredNodeSelector = createSelector(pathToNodeSelector, hoveredNodePathSelector, (pathToNode, hoveredNodePath) =>
    pathToNode.get(hoveredNodePath)
)
