import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"

export const marginSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.margin)
