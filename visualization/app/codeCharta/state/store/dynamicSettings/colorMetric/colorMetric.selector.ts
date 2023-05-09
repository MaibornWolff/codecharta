import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorMetric)
