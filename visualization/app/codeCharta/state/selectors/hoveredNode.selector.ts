import { createSelector } from "@ngrx/store"
import { hoveredNodeIdSelector } from "../../sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const hoveredNodeSelector = createSelector(pathToNodeSelector, hoveredNodeIdSelector, (pathToNode, hoveredNodeId) =>
    pathToNode.get(hoveredNodeId)
)
