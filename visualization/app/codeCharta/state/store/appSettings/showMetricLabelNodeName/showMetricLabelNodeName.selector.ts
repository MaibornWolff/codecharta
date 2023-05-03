import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const showMetricLabelNodeNameSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNodeName)
