import { createSelector } from "../../../state/angular-redux/createSelector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDescriptors, MetricDescriptors } from "../../../util/metric/metricDescriptors"

export const legendAreaMetricSelector: (state: CcState) => MetricDescriptors = createSelector(
	[areaMetricSelector, attributeDescriptorsSelector],
	(areaMetric, attributeDescriptors) => getMetricDescriptors(areaMetric, attributeDescriptors)
)
