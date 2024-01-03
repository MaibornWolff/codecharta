import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isFileExplorerPinnedSelector = createSelector(appSettingsSelector, appSettings => appSettings.isFileExplorerPinned)
