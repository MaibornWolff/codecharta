import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const heightMetricSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.heightMetric)
