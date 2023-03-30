import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const colorLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.colorLabels)
