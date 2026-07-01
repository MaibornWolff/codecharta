import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const showOnlyBuildingsWithEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showOnlyBuildingsWithEdges)
