import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorModeSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorMode)
