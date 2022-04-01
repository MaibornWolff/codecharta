import { createSelector } from "../angular-redux/createSelector"
import { hoveredNodeIdSelector } from "../store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const hoveredNodeSelector = createSelector([idToNodeSelector, hoveredNodeIdSelector], (idToNode, hoveredNodeId) =>
	idToNode.get(hoveredNodeId)
)
