import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const sharpnessModeSelector = createSelector([appSettingsSelector], appSettings => appSettings.sharpnessMode)
