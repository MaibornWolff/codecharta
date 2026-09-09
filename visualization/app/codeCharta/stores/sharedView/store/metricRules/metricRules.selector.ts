import { createSelector } from "@ngrx/store"
import { sharedViewSelector } from "../sharedView.selector"

export const metricRulesSelector = createSelector(sharedViewSelector, sharedView => sharedView.metricRules)
