import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const heightMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.heightMetric)
