import { appSettingsSelector } from "../appSettings.selector"
import { createSelector } from "../../../angular-redux/store"

export const experimentalFeaturesEnabledSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.experimentalFeaturesEnabled
)
