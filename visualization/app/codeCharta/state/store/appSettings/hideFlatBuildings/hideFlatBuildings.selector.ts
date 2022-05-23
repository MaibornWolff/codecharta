import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const hideFlatBuildingsSelector = createSelector([appSettingsSelector], appSettings => appSettings.hideFlatBuildings)
