import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const sortingOrderAscendingSelector = createSelector(appSettingsSelector, appSettings => appSettings.sortingOrderAscending)
