import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const labelModeSelector = createSelector(appSettingsSelector, appSettings => appSettings.labelMode)

export const amountOfTopLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.amountOfTopLabels)

export const showMetricLabelNodeNameSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNodeName)

export const showMetricLabelNameValueSelector = createSelector(appSettingsSelector, appSettings => appSettings.showMetricLabelNameValue)

export const colorLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.colorLabels)

export const groupLabelCollisionsSelector = createSelector(appSettingsSelector, appSettings => appSettings.groupLabelCollisions)
