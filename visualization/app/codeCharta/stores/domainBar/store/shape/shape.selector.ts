import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const shapeSelector = createSelector(domainBarSelector, domainBar => domainBar.shape)
