import { createSelector } from "../../../angular-redux/store"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const focusedNodePathSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.focusedNodePath)
