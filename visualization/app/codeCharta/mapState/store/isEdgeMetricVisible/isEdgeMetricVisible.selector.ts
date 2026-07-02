import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const isEdgeMetricVisibleSelector = createSelector(appSettingsSelector, appSettings => appSettings.isEdgeMetricVisible)
