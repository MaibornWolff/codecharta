import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const shrinkToFitSelector = createSelector(domainBarSelector, domainBar => domainBar.shrinkToFit)
