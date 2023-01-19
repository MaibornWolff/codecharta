import { createSelector } from "../../../state/angular-redux/createSelector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDecorations, MetricDecorations } from "../../attributeSideBar/util/metricDecorations"

export const legendAreaMetricSelector: (state: CcState) => MetricDecorations = createSelector(
	[areaMetricSelector, attributeDescriptorsSelector],
	(areaMetric, attributeDescriptors) => getMetricDecorations(areaMetric, attributeDescriptors)
)
