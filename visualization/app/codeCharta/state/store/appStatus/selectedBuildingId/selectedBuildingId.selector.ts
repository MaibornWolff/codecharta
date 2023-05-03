import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../appStatus.selector"

export const selectedBuildingIdSelector = createSelector(appStatusSelector, appStatus => appStatus.selectedBuildingId)
