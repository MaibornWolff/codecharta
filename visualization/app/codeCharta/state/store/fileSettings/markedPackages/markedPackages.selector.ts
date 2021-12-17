import { createSelector } from "../../../angular-redux/store"
import { fileSettingsSelector } from "../fileSettings.selector"

export const markedPackagesSelector = createSelector([fileSettingsSelector], fileSettings => fileSettings.markedPackages)
