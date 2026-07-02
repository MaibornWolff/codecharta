import { createSelector } from "@ngrx/store"
import { hoveredNodeIdSelector } from "../../mapState/store/hoveredNodeId/hoveredNodeId.selector"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const hoveredNodeSelector = createSelector(idToNodeSelector, hoveredNodeIdSelector, (idToNode, hoveredNodeId) =>
    idToNode.get(hoveredNodeId)
)
