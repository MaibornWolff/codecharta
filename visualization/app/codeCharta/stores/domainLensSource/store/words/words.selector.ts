import { createSelector } from "@ngrx/store"
import { domainLensSourceSelector } from "../domainLensSource.selector"

export const domainWordsSelector = createSelector(domainLensSourceSelector, source => source.words)
