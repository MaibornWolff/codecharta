import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const sizeRangeSelector = createSelector(domainBarSelector, domainBar => domainBar.sizeRange)
