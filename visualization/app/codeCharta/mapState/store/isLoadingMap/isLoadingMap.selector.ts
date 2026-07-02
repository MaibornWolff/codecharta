import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const isLoadingMapSelector = createSelector(appSettingsSelector, appSettings => appSettings.isLoadingMap)
