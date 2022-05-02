import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const invertHeightSelector = createSelector([appSettingsSelector], appSettings => appSettings.invertHeight)
