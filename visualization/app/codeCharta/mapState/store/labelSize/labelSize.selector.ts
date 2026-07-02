import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const labelSizeSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelSize)
