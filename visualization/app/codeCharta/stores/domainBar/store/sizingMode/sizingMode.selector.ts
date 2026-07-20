import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const sizingModeSelector = createSelector(domainBarSelector, domainBar => domainBar.sizingMode)
