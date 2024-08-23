import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const safeReloadSelector = createSelector(appSettingsSelector, appSettings => appSettings.safeReload)
