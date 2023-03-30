import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const heightMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.heightMetric)
