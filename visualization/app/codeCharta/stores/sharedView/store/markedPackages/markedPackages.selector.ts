import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const markedPackagesSelector = createSelector(sharedViewSelector, sharedView => sharedView.markedPackages)
