import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const marginSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.margin)
