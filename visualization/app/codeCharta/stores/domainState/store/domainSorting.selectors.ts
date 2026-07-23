import { createSelector } from "@ngrx/store"
import { domainStateSelector } from "./domainState.selector"

export const domainStateSortingOrderSelector = createSelector(domainStateSelector, domainState => domainState.sortingOrder)
export const domainStateSortingOrderAscendingSelector = createSelector(
    domainStateSelector,
    domainState => domainState.sortingOrderAscending
)
