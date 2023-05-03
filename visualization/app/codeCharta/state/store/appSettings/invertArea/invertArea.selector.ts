import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const invertAreaSelector = createSelector(appSettingsSelector, appSettings => appSettings.invertArea)
