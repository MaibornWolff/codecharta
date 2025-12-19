import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const preferredEditorSelector = createSelector(appSettingsSelector, appSettings => appSettings.preferredEditor)
