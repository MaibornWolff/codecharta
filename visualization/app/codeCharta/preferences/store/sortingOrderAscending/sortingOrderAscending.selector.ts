import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const sortingOrderAscendingSelector = createSelector(appSettingsSelector, appSettings => appSettings.sortingOrderAscending)
