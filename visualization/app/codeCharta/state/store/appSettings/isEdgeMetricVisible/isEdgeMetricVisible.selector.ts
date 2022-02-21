import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isEdgeMetricVisibleSelector = createSelector([appSettingsSelector], appSettings => appSettings.isEdgeMetricVisible)
