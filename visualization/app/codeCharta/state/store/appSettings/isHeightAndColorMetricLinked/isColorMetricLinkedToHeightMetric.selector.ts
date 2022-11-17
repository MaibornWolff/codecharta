import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const isColorMetricLinkedToHeightMetricSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.isColorMetricLinkedToHeightMetric
)
