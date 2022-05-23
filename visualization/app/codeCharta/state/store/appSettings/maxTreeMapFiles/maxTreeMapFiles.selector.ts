import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const maxTreeMapFilesSelector = createSelector([appSettingsSelector], appSettings => appSettings.maxTreeMapFiles)
