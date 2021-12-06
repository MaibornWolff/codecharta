import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const edgeMetricSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.edgeMetric)
