import { createSelector } from "@ngrx/store"
import { selectedBuildingIdSelector } from "../../mapState/store/selectedBuildingId/selectedBuildingId.selector"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const selectedNodeSelector = createSelector(selectedBuildingIdSelector, idToNodeSelector, (selectedBuildingId, idToNode) =>
    idToNode?.get(selectedBuildingId)
)
