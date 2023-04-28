import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorRangeSelector = createSelector(dynamicSettingsSelector, dynamicAppSettings => dynamicAppSettings.colorRange)
