import { createSelector } from "@ngrx/store"
import { selectedBuildingIdSelector } from "../../sharedView/sharedView.read.facade"
import { idToNodeSelector } from "./accumulatedData/idToNode.selector"

export const selectedNodeSelector = createSelector(selectedBuildingIdSelector, idToNodeSelector, (selectedBuildingId, idToNode) =>
    idToNode?.get(selectedBuildingId)
)
