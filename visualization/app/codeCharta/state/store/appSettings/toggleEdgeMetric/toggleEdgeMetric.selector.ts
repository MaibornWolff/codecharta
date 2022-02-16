import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const toggleEdgeMetricSelector = createSelector([appSettingsSelector], appSettings => appSettings.edgeMetricToggler)
