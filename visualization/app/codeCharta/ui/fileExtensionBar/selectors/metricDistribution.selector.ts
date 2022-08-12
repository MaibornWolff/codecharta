import { createSelector } from "../../../state/angular-redux/createSelector"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { distributionMetricSelector } from "../../../state/store/dynamicSettings/distributionMetric/distributionMetric.selector"
import { CcState } from "../../../state/store/store"
import { FileExtensionCalculator, MetricDistribution } from "./fileExtensionCalculator"

export const metricDistributionSelector: (state: CcState) => MetricDistribution[] = createSelector(
	[accumulatedDataSelector, distributionMetricSelector],
	(accumulatedData, distributionMetric) =>
		FileExtensionCalculator.getMetricDistribution(accumulatedData.unifiedMapNode, distributionMetric)
)
