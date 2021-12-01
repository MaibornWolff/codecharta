import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const areaMetricSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.areaMetric)
