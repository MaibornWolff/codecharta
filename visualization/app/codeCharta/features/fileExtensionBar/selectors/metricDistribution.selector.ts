import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { FileExtensionCalculator } from "../../../util/fileExtension/fileExtensionCalculator"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"

export const metricDistributionSelector = createSelector(
    accumulatedDataSelector,
    areaMetricSelector,
    (accumulatedData, distributionMetric) =>
        FileExtensionCalculator.getMetricDistribution(accumulatedData.unifiedMapNode, distributionMetric)
)
