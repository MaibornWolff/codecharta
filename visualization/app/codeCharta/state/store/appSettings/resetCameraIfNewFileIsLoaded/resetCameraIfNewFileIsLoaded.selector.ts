import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const resetCameraIfNewFileIsLoadedSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.resetCameraIfNewFileIsLoaded
)
