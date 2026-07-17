import { createSelector } from "@ngrx/store"
import { selectedBuildingIdSelector } from "../../stores/sharedView/sharedView.read.facade"
import { pathToNodeSelector } from "./accumulatedData/pathToNode.selector"

export const selectedNodeSelector = createSelector(selectedBuildingIdSelector, pathToNodeSelector, (selectedBuildingId, pathToNode) =>
    pathToNode?.get(selectedBuildingId)
)
