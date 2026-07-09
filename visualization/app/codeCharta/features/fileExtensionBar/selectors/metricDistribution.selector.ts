import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { FileExtensionCalculator } from "../../../util/fileExtension/fileExtensionCalculator"

export const metricDistributionSelector = createSelector(
    accumulatedDataSelector,
    areaMetricSelector,
    (accumulatedData, distributionMetric) =>
        FileExtensionCalculator.getMetricDistribution(accumulatedData.unifiedMapNode, distributionMetric)
)
