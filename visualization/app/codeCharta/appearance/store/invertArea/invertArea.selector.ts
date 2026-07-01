import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const invertAreaSelector = createSelector(appSettingsSelector, appSettings => appSettings.invertArea)
