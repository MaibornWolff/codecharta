import { createSelector } from "@ngrx/store"
import { hoveredNodeIdSelector } from "../../sharedView/sharedView.read.facade"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const hoveredNodeSelector = createSelector(idToNodeSelector, hoveredNodeIdSelector, (idToNode, hoveredNodeId) =>
    idToNode.get(hoveredNodeId)
)
