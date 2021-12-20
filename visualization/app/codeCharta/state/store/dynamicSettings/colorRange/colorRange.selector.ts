import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorRangeSelector = createSelector([dynamicSettingsSelector], dynamicAppSettings => dynamicAppSettings.colorRange)
