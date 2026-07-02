import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const labelModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelMode)
