import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isPresentationModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.isPresentationMode)
