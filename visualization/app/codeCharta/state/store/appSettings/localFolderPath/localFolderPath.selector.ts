import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const localFolderPathSelector = createSelector(appSettingsSelector, appSettings => appSettings.localFolderPath)
