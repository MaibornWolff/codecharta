import { createSelector } from "../../../state/angular-redux/createSelector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDescriptors, MetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

export const legendColorMetricSelector: (state: CcState) => MetricDescriptors = createSelector(
	[colorMetricSelector, attributeDescriptorsSelector],
	(colorMetric, attributeDescriptors) => getMetricDescriptors(colorMetric, attributeDescriptors)
)
