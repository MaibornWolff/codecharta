import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const rotationRangeSelector = createSelector(domainBarSelector, domainBar => domainBar.rotationRange)
