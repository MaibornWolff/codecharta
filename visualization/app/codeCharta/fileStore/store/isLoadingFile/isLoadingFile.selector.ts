import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const isLoadingFileSelector = createSelector(appSettingsSelector, appSettings => appSettings.isLoadingFile)
