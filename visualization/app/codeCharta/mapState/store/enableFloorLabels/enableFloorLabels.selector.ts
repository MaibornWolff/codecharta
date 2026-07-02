import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const enableFloorLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.enableFloorLabels)
