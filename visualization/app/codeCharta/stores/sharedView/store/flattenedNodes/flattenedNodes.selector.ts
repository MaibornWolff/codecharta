import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const flattenedNodesSelector = createSelector(sharedViewSelector, sharedView => sharedView.flattenedNodes)

export const sortedFlattenedNodesSelector = createSelector(flattenedNodesSelector, flattenedNodes =>
    [...flattenedNodes].sort((a, b) => a.path.localeCompare(b.path))
)
