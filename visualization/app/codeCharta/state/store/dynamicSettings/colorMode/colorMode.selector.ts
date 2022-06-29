import { createSelector } from "../../../angular-redux/createSelector"
import { dynamicSettingsSelector } from "../dynamicSettings.selector"

export const colorModeSelector = createSelector([dynamicSettingsSelector], dynamicSettings => dynamicSettings.colorMode)
