import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../appStatus.selector"

export const hoveredNodeIdSelector = createSelector(appStatusSelector, appStatus => appStatus.hoveredNodeId)
