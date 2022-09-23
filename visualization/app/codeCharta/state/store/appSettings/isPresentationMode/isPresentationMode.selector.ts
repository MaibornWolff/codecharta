import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isPresentationModeSelector = createSelector([appSettingsSelector], appSettings => appSettings.isPresentationMode)
