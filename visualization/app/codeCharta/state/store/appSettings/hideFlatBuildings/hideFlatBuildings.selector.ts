import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const hideFlatBuildingsSelector = createSelector(appSettingsSelector, appSettings => appSettings.hideFlatBuildings)
