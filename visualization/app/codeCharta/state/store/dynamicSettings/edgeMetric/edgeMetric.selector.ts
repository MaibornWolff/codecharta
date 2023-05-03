import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const edgeMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.edgeMetric)
