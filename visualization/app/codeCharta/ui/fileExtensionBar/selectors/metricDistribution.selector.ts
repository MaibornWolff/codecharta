import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { FileExtensionCalculator } from "./fileExtensionCalculator"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

export const metricDistributionSelector = createSelector(
    accumulatedDataSelector,
    areaMetricSelector,
    (accumulatedData, distributionMetric) =>
        FileExtensionCalculator.getMetricDistribution(accumulatedData.unifiedMapNode, distributionMetric)
)
