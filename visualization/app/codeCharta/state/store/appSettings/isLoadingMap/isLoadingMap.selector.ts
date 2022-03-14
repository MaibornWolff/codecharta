import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isLoadingMapSelector = createSelector([appSettingsSelector], appSettings => appSettings.isLoadingMap)
