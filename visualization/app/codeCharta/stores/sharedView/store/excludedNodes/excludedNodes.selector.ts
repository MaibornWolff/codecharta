import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const excludedNodesSelector = createSelector(sharedViewSelector, sharedView => sharedView.excludedNodes)
