import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const showOnlyBuildingsWithEdgesSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.showOnlyBuildingsWithEdges
)
