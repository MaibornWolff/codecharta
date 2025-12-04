import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"
import { fileSettingsSelector } from "../../../state/store/fileSettings/fileSettings.selector"
import { filesSelector } from "../../../state/store/files/files.selector"

export const areaMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.areaMetric)

export const heightMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.heightMetric)

export const colorMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorMetric)

export const colorRangeSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorRange)

export const colorModeSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorMode)

export const attributeDescriptorsSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeDescriptors)

export const blacklistSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.blacklist)

export const print3DFilesSelector = createSelector(filesSelector, files => files)
