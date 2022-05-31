import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const screenshotToClipboardEnabledSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.screenshotToClipboardEnabled
)
