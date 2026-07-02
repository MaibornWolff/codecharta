import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const scalingSelector = createSelector(appSettingsSelector, appSettings => appSettings.scaling)
