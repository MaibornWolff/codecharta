import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const enableFloorLabelsSelector = createSelector([appSettingsSelector], appSettings => appSettings.enableFloorLabels)
