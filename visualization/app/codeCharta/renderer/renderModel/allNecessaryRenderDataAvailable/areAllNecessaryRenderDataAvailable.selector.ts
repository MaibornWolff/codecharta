import { createSelector } from "@ngrx/store"
import { nodeMetricDataSelector } from "../nodeMetricData/nodeMetricData.selector"
import { areaMetricSelector, colorMetricSelector, heightMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { areMetricsAvailable } from "./utils/areMetricsAvailable"

export const areChosenMetricsAvailableSelector = createSelector(
    nodeMetricDataSelector,
    areaMetricSelector,
    colorMetricSelector,
    heightMetricSelector,
    (nodeMetricData, areaMetric, colorMetric, heightMetric) => areMetricsAvailable(nodeMetricData, [areaMetric, colorMetric, heightMetric])
)
