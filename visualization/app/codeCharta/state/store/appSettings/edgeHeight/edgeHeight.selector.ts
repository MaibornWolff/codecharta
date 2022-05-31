import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const edgeHeightSelector = createSelector([appSettingsSelector], appSettings => appSettings.edgeHeight)
