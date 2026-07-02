import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const labelsPerMapSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelsPerMap)
