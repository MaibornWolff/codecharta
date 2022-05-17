import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const colorLabelsSelector = createSelector([appSettingsSelector], appSettings => appSettings.colorLabels)
