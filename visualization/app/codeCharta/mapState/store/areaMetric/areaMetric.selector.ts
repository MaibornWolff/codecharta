import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const areaMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.areaMetric)
