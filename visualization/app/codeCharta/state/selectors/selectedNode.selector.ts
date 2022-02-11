import { createSelector } from "../angular-redux/store"
import { selectedBuildingIdSelector } from "../store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const selectedNodeSelector = createSelector([selectedBuildingIdSelector, idToNodeSelector], (selectedBuildingId, idToNode) =>
	idToNode?.get(selectedBuildingId)
)
