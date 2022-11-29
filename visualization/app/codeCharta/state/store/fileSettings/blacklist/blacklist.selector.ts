import { createSelector } from "../../../angular-redux/createSelector"
import { fileSettingsSelector } from "../fileSettings.selector"

export const blacklistSelector = createSelector([fileSettingsSelector], fileSettings => fileSettings.blacklist)
