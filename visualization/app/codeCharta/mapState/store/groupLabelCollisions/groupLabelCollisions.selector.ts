import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const groupLabelCollisionsSelector = createSelector(appSettingsSelector, appSettings => appSettings.groupLabelCollisions)
