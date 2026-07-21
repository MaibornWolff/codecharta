import { createSelector } from "@ngrx/store"
import { domainStateSelector } from "./domainState.selector"

/** The domain view's OWN explorer sort — separate from the map view's global `preferences.sorting`. */
export const domainStateSortingOrderSelector = createSelector(domainStateSelector, domainState => domainState.sortingOrder)
export const domainStateSortingOrderAscendingSelector = createSelector(
    domainStateSelector,
    domainState => domainState.sortingOrderAscending
)
