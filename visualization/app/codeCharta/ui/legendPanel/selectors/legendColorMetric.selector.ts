import { createSelector } from "../../../state/angular-redux/createSelector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDecorations, MetricDecorations } from "../../attributeSideBar/util/metricDecorations"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const legendColorMetricSelector: (state: CcState) => MetricDecorations = createSelector(
	[colorMetricSelector, attributeDescriptorsSelector],
	(colorMetric, attributeDescriptors) => getMetricDecorations(colorMetric, attributeDescriptors)
)
