import { createSelector } from "@ngrx/store"
import { fileStatesAvailable } from "../../../model/files/files.helper"
import { dynamicSettingsSelector } from "../../store/dynamicSettings/dynamicSettings.selector"
import { filesSelector } from "../../../fileStore/store/files.selector"
import { nodeMetricDataSelector } from "../nodeMetricData/nodeMetricData.selector"
import {
    colorRangeSelector,
    areaMetricSelector,
    colorMetricSelector,
    heightMetricSelector,
    distributionMetricSelector,
    edgeMetricSelector
} from "../../../mapState/mapState.facade"
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

// Slice 7: the metric SELECTION moved to mapState, but the first-render availability gate must still
// check the same values it did when they lived on dynamicSettings (notably distributionMetric, which
// areChosenMetrics does NOT cover). Fold the five metrics back in from mapState so the checked object
// is value-identical to the pre-Slice-7 { ...dynamicSettings, colorRange }.
const areDynamicSettingsAvailableSelector = createSelector(
    dynamicSettingsSelector,
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    distributionMetricSelector,
    edgeMetricSelector,
    colorRangeSelector,
    (dynamicSettings, areaMetric, heightMetric, colorMetric, distributionMetric, edgeMetric, colorRange) =>
        areDynamicSettingsAvailable({ ...dynamicSettings, areaMetric, heightMetric, colorMetric, distributionMetric, edgeMetric, colorRange })
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
