import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const keptHighlightPathsSelector = createSelector(sharedViewSelector, sharedView => sharedView.keptHighlightPaths)
