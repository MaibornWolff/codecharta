import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const colorLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.colorLabels)
