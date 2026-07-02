import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const edgeMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.edgeMetric)
