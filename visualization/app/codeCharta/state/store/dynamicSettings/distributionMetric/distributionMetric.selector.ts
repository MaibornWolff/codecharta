import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const distributionMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.distributionMetric)
