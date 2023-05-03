import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { getMetricDescriptors } from "../../../util/metric/metricDescriptors"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { createSelector } from "@ngrx/store"

export const legendColorMetricSelector = createSelector(
	colorMetricSelector,
	attributeDescriptorsSelector,
	(colorMetric, attributeDescriptors) => getMetricDescriptors(colorMetric, attributeDescriptors)
)
