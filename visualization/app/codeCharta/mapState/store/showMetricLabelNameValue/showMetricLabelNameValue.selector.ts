import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const showMetricLabelNodeValueSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNameValue)
