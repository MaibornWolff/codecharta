import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const layoutAlgorithmSelector = createSelector(appSettingsSelector, appSettings => appSettings.layoutAlgorithm)
