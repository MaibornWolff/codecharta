import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const focusedNodePathSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.focusedNodePath)
