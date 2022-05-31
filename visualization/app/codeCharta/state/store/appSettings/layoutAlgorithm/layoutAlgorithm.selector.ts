import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const layoutAlgorithmSelector = createSelector([appSettingsSelector], appSettings => appSettings.layoutAlgorithm)
