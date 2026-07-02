import { createSelector } from "@ngrx/store"
import { fileStatesAvailable } from "../../../model/files/files.helper"
import { dynamicSettingsSelector } from "../../store/dynamicSettings/dynamicSettings.selector"
import { filesSelector } from "../../../fileStore/store/files.selector"
import { nodeMetricDataSelector } from "../../../lenses/metrics/metricsLens.facade"
import { colorRangeSelector, areaMetricSelector, colorMetricSelector, heightMetricSelector } from "../../../mapState/mapState.facade"
import { areDynamicSettingsAvailable } from "./utils/areDynamicSettingsAvailable"
import { areMetricsAvailable } from "./utils/areMetricsAvailable"

const areFileStatesAvailableSelector = createSelector(filesSelector, files => fileStatesAvailable(files))

export const areChosenMetricsAvailableSelector = createSelector(
    nodeMetricDataSelector,
    areaMetricSelector,
    colorMetricSelector,
    heightMetricSelector,
    (nodeMetricData, areaMetric, colorMetric, heightMetric) => areMetricsAvailable(nodeMetricData, [areaMetric, colorMetric, heightMetric])
)

const areDynamicSettingsAvailableSelector = createSelector(
    dynamicSettingsSelector,
    colorRangeSelector,
    (dynamicSettings, colorRange) => areDynamicSettingsAvailable({ ...dynamicSettings, colorRange })
)

export const areAllNecessaryRenderDataAvailableSelector = createSelector(
    nodeMetricDataSelector,
    areFileStatesAvailableSelector,
    areChosenMetricsAvailableSelector,
    areDynamicSettingsAvailableSelector,
    (nodeMetricData, areFileStatesAvailable, areChosenMetricsAvailable, areDynamicSettingsAvailable) => {
        if (nodeMetricData === null || !areFileStatesAvailable || !areChosenMetricsAvailable || !areDynamicSettingsAvailable) {
            return false
        }

        return true
    }
)
