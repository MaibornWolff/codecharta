import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isSearchPanelPinnedSelector = createSelector(appSettingsSelector, appSettings => appSettings.isSearchPanelPinned)
