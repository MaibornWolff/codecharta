import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const scalingSelector = createSelector([appSettingsSelector], appSettings => appSettings.scaling)
