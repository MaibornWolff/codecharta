import { createSelector } from "@ngrx/store"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"
import { fileSettingsSelector } from "../../../state/store/fileSettings/fileSettings.selector"
import { filesSelector } from "../../../fileStore/store/files.selector"
import { mapStateSelector } from "../../../mapState/mapState.facade"

export const areaMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.areaMetric)

export const heightMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.heightMetric)

export const colorMetricSelector = createSelector(dynamicSettingsSelector, dynamicSettings => dynamicSettings.colorMetric)

export const colorRangeSelector = createSelector(mapStateSelector, mapState => mapState.colorRange)

export const colorModeSelector = createSelector(mapStateSelector, mapState => mapState.colorMode)

export const attributeDescriptorsSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeDescriptors)

export const blacklistSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.blacklist)

export const print3DFilesSelector = createSelector(filesSelector, files => files)
