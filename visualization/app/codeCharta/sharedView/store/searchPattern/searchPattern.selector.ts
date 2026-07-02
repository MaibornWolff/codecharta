import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const searchPatternSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.searchPattern)
