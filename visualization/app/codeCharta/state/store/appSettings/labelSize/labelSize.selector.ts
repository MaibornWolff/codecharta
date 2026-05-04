import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const labelSizeSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelSize)
