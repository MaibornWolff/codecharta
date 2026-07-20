import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const drawOutOfBoundSelector = createSelector(domainBarSelector, domainBar => domainBar.drawOutOfBound)
