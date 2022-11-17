import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const experimentalFeaturesEnabledSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.experimentalFeaturesEnabled
)
