import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const marginSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.margin)
