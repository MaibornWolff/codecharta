import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../../../state/store/appStatus/appStatus.selector"

export const rightClickedNodeDataSelector = createSelector(appStatusSelector, appStatus => appStatus.rightClickedNodeData)
