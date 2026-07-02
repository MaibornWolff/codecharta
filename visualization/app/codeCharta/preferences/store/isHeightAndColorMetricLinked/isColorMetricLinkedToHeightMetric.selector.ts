import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const isColorMetricLinkedToHeightMetricSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.isColorMetricLinkedToHeightMetric
)
