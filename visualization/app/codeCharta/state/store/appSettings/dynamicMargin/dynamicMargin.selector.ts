import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const dynamicMarginSelector = createSelector([appSettingsSelector], appSettings => appSettings.dynamicMargin)
