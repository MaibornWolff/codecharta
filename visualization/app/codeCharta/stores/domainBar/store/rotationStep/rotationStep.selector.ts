import { createSelector } from "@ngrx/store"
import { domainBarSelector } from "../domainBar.selector"

export const rotationStepSelector = createSelector(domainBarSelector, domainBar => domainBar.rotationStep)
