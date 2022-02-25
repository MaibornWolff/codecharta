import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isLoadingFileSelector = createSelector([appSettingsSelector], appSettings => appSettings.isLoadingFile)
