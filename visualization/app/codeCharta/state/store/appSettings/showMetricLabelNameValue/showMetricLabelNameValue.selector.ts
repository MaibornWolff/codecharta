import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const showMetricLabelNodeValueSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNameValue)
