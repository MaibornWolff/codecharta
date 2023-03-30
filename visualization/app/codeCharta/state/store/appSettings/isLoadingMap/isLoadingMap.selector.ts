import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isLoadingMapSelector = createSelector(appSettingsSelector, appSettings => appSettings.isLoadingMap)
