import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isHeightAndColorMetricLinkedSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.isHeightAndColorMetricLinked
)
