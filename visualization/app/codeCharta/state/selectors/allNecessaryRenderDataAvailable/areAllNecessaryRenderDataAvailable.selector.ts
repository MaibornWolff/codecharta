import { createSelector } from "@ngrx/store"
import { fileStatesAvailable } from "../../../model/files/files.helper"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { dynamicSettingsSelector } from "../../store/dynamicSettings/dynamicSettings.selector"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { filesSelector } from "../../../fileStore/store/files.selector"
import { nodeMetricDataSelector } from "../../../lenses/metrics/metricsLens.facade"
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

const areDynamicSettingsAvailableSelector = createSelector(dynamicSettingsSelector, dynamicSettings =>
    areDynamicSettingsAvailable(dynamicSettings)
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
