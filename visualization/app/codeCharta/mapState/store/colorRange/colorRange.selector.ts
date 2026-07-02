import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const colorRangeSelector = createSelector(dynamicSettingsSelector, dynamicAppSettings => dynamicAppSettings.colorRange)
