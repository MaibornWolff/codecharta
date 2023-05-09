import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const sortingOrderSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.sortingOption)
