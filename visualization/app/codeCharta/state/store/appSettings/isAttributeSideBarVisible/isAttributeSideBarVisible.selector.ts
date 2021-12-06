import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isAttributeSideBarVisibleSelector = createSelector([appSettingsSelector], appSettings => appSettings.isAttributeSideBarVisible)
