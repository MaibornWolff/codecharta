import { createSelector } from "@ngrx/store"
import { focusedNodePathSelector } from "./focusedNodePath.selector"

export const currentFocusedNodePathSelector = createSelector(focusedNodePathSelector, focusedNodePath => focusedNodePath[0])
