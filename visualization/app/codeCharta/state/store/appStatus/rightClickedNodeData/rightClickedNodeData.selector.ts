import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../appStatus.selector"

export const rightClickedNodeDataSelector = createSelector(appStatusSelector, appStatus => appStatus.rightClickedNodeData)
