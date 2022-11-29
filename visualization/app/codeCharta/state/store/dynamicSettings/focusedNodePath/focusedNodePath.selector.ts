import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const focusedNodePathSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.focusedNodePath)
