import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const preferredEditorSelector = createSelector(appSettingsSelector, appSettings => appSettings.preferredEditor)

export const localFolderPathSelector = createSelector(appSettingsSelector, appSettings => appSettings.localFolderPath)
