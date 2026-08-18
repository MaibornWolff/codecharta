import { createSelector } from "@ngrx/store"
import { domainStateSelector } from "./domainState.selector"

export const domainStateSearchPatternSelector = createSelector(domainStateSelector, domainState => domainState.searchPattern)
