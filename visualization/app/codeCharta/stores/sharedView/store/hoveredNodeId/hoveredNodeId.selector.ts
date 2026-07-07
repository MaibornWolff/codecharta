import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const hoveredNodeIdSelector = createSelector(sharedViewSelector, sharedView => sharedView.hoveredNodeId)
