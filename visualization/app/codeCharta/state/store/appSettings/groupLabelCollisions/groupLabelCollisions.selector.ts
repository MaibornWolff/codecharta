import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const groupLabelCollisionsSelector = createSelector(appSettingsSelector, appSettings => appSettings.groupLabelCollisions)
