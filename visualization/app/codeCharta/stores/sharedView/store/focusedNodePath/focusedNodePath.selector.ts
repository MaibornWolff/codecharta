import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const focusedNodePathSelector = createSelector(sharedViewSelector, sharedView => sharedView.focusedNodePath)
