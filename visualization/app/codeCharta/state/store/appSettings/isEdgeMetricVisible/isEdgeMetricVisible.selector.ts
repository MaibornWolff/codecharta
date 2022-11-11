import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isEdgeMetricVisibleSelector = createSelector([appSettingsSelector], appSettings => appSettings.isEdgeMetricVisible)
