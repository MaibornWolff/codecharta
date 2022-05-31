import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const distributionMetricSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.distributionMetric)
