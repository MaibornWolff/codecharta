import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { getMetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { createSelector } from "@ngrx/store"

export const legendHeightMetricSelector = createSelector(
	heightMetricSelector,
	attributeDescriptorsSelector,
	(heightMetric, attributeDescriptors) => getMetricDescriptors(heightMetric, attributeDescriptors)
)
