import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const labelsPerMapSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelsPerMap)
