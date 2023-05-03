import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isWhiteBackgroundSelector = createSelector(appSettingsSelector, appSettings => appSettings.isWhiteBackground)
