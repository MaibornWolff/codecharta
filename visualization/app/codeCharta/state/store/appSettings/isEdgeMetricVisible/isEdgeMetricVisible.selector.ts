import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const isEdgeMetricVisibleSelector = createSelector(appSettingsSelector, appSettings => appSettings.isEdgeMetricVisible)
