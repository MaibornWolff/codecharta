import { createSelector } from "@ngrx/store"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { getMetricDescriptors } from "../../attributeSideBar/util/metricDescriptors"

export const legendAreaMetricSelector = createSelector(
	areaMetricSelector,
	attributeDescriptorsSelector,
	(areaMetric, attributeDescriptors) => getMetricDescriptors(areaMetric, attributeDescriptors)
)
