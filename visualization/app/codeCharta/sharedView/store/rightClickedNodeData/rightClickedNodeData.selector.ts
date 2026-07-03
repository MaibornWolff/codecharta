import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const rightClickedNodeDataSelector = createSelector(sharedViewSelector, sharedView => sharedView.rightClickedNodeData)
