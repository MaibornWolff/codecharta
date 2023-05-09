import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const mapColorsSelector = createSelector(appSettingsSelector, appSettings => appSettings.mapColors)
