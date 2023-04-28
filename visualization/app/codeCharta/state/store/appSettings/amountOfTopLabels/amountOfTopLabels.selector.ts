import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const amountOfTopLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.amountOfTopLabels)
