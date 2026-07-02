import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const invertHeightSelector = createSelector(appSettingsSelector, appSettings => appSettings.invertHeight)
