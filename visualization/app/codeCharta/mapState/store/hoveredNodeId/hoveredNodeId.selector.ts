import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../../../state/store/appStatus/appStatus.selector"

export const hoveredNodeIdSelector = createSelector(appStatusSelector, appStatus => appStatus.hoveredNodeId)
