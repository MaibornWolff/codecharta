import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const maxTreeMapFilesSelector = createSelector(appSettingsSelector, appSettings => appSettings.maxTreeMapFiles)
