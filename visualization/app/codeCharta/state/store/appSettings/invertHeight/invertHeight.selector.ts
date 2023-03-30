import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const invertHeightSelector = createSelector(appSettingsSelector, appSettings => appSettings.invertHeight)
