import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const searchPatternSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.searchPattern)
