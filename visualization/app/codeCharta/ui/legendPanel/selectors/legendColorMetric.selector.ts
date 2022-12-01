import { createSelector } from "../../../state/angular-redux/createSelector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../state/store/store"
import { getLegendMetric, LegendMetric } from "./legendMetric"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const legendColorMetricSelector: (state: CcState) => LegendMetric = createSelector(
	[colorMetricSelector, attributeDescriptorsSelector],
	(colorMetric, attributeDescriptors) => getLegendMetric(colorMetric, attributeDescriptors)
)
