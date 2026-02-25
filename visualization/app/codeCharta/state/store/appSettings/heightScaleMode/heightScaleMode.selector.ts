import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const heightScaleModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.heightScaleMode)
