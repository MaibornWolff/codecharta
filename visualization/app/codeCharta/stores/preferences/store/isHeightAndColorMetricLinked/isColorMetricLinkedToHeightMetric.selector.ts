import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const isColorMetricLinkedToHeightMetricSelector = createSelector(
    preferencesSelector,
    preferences => preferences.isColorMetricLinkedToHeightMetric
)
