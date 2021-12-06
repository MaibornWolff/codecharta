import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorMetricSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.colorMetric)
