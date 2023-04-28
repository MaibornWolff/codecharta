import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isLoadingFileSelector = createSelector(appSettingsSelector, appSettings => appSettings.isLoadingFile)
