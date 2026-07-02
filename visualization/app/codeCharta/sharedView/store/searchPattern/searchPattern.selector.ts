import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const searchPatternSelector = createSelector(sharedViewSelector, sharedView => sharedView.searchPattern)
