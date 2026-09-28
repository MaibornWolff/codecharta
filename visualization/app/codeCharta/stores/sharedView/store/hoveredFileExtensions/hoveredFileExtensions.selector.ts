import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const hoveredFileExtensionsSelector = createSelector(sharedViewSelector, sharedView => sharedView.hoveredFileExtensions)
