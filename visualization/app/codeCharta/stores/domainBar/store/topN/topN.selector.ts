import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const topNSelector = createSelector(domainBarSelector, domainBar => domainBar.topN)
