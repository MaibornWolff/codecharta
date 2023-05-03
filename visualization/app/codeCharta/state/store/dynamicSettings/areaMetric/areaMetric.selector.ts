import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const areaMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.areaMetric)
