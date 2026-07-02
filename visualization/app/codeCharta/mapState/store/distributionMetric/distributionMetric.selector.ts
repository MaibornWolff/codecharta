import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const distributionMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.distributionMetric)
