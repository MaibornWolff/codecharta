import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const sharpnessModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.sharpnessMode)
