import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const showMetricLabelNodeValueSelector = createSelector([appSettingsSelector], appSettings => appSettings.showMetricLabelNameValue)
