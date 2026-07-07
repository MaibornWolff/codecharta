import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const selectedBuildingIdSelector = createSelector(sharedViewSelector, sharedView => sharedView.selectedBuildingId)
