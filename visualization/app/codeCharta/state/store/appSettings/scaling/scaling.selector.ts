import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const scalingSelector = createSelector(appSettingsSelector, appSettings => appSettings.scaling)
