import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isColorMetricLinkedToHeightMetricSelector = createSelector(
	appSettingsSelector,
	appSettings => appSettings.isColorMetricLinkedToHeightMetric
)
