import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../../../state/store/fileSettings/fileSettings.selector"
import { filesSelector } from "../../../fileStore/store/files.selector"
import { mapStateSelector } from "../../../mapState/mapState.facade"

export const areaMetricSelector = createSelector(mapStateSelector, mapState => mapState.areaMetric)

export const heightMetricSelector = createSelector(mapStateSelector, mapState => mapState.heightMetric)

export const colorMetricSelector = createSelector(mapStateSelector, mapState => mapState.colorMetric)

export const colorRangeSelector = createSelector(mapStateSelector, mapState => mapState.colorRange)

export const colorModeSelector = createSelector(mapStateSelector, mapState => mapState.colorMode)

export const attributeDescriptorsSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeDescriptors)

export const blacklistSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.blacklist)

export const print3DFilesSelector = createSelector(filesSelector, files => files)
