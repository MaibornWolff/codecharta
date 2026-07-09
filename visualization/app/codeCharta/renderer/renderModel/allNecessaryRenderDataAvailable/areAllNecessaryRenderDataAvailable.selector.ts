import { createSelector } from "@ngrx/store"
import { areaMetricSelector, colorMetricSelector, heightMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { nodeMetricDataSelector } from "../nodeMetricData/nodeMetricData.selector"
import { areMetricsAvailable } from "./utils/areMetricsAvailable"

export const areChosenMetricsAvailableSelector = createSelector(
    nodeMetricDataSelector,
    areaMetricSelector,
    colorMetricSelector,
    heightMetricSelector,
    (nodeMetricData, areaMetric, colorMetric, heightMetric) => areMetricsAvailable(nodeMetricData, [areaMetric, colorMetric, heightMetric])
)
