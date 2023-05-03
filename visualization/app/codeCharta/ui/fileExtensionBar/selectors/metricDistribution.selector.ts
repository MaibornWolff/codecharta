import { createSelector } from "@ngrx/store"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"
import { FileExtensionCalculator } from "./fileExtensionCalculator"

export const metricDistributionSelector = createSelector(
	accumulatedDataSelector,
	distributionMetricSelector,
	(accumulatedData, distributionMetric) =>
		FileExtensionCalculator.getMetricDistribution(accumulatedData.unifiedMapNode, distributionMetric)
)
