import { createSelector } from "../../../angular-redux/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isHeightAndColorMetricCoupledSelector = createSelector(
	[appSettingsSelector],
	appSettings => appSettings.isHeightAndColorMetricCoupled
)
