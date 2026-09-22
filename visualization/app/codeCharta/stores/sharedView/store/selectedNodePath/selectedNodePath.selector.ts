import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const selectedNodePathSelector = createSelector(sharedViewSelector, sharedView => sharedView.selectedNodePath)
