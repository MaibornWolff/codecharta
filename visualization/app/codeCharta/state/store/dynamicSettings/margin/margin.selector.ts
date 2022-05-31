import { createSelector } from "../../../angular-redux/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const marginSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.margin)
