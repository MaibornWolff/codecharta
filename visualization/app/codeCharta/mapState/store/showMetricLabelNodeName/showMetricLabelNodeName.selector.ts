import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const showMetricLabelNodeNameSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNodeName)
