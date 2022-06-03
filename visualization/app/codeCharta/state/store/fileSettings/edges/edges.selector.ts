import { createSelector } from "../../../angular-redux/createSelector"
import { fileSettingsSelector } from "../fileSettings.selector"

export const edgesSelector = createSelector([fileSettingsSelector], fileSettings => fileSettings.edges)
