import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const edgeHeightSelector = createSelector(appSettingsSelector, appSettings => appSettings.edgeHeight)
