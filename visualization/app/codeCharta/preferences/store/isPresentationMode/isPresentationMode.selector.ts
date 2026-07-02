import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const isPresentationModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.isPresentationMode)
