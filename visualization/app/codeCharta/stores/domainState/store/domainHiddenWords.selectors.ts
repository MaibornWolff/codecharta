import { createSelector } from "@ngrx/store"
import { domainStateSelector } from "./domainState.selector"

export const domainStateHiddenWordsSelector = createSelector(domainStateSelector, domainState => domainState.hiddenWords)
