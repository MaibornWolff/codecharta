import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isWhiteBackgroundSelector = createSelector([appSettingsSelector], appSettings => appSettings.isWhiteBackground)
