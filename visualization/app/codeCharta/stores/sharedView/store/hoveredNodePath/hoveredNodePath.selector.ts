import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const hoveredNodePathSelector = createSelector(sharedViewSelector, sharedView => sharedView.hoveredNodePath)
