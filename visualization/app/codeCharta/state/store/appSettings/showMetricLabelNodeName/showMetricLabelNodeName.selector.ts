import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const showMetricLabelNodeNameSelector = createSelector([appSettingsSelector], appSettings => appSettings.showMetricLabelNodeName)
