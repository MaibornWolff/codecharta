import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const showOnlyBuildingsWithEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showOnlyBuildingsWithEdges)
