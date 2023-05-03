import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const enableFloorLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.enableFloorLabels)
