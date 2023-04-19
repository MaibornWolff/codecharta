import { createSelector } from "../../../state/angular-redux/createSelector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDescriptors, MetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

export const legendHeightMetricSelector: (state: CcState) => MetricDescriptors = createSelector(
	[heightMetricSelector, attributeDescriptorsSelector],
	(heightMetric, attributeDescriptors) => getMetricDescriptors(heightMetric, attributeDescriptors)
)
