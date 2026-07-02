import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const focusedNodePathSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.focusedNodePath)
