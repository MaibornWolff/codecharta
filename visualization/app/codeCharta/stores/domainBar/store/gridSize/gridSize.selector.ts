import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const gridSizeSelector = createSelector(domainBarSelector, domainBar => domainBar.gridSize)
