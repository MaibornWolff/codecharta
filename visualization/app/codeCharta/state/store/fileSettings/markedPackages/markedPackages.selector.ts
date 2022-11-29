import { createSelector } from "../../../angular-redux/createSelector"
import { fileSettingsSelector } from "../fileSettings.selector"

export const markedPackagesSelector = createSelector([fileSettingsSelector], fileSettings => fileSettings.markedPackages)
