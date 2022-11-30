import { createSelector } from "../../../state/angular-redux/createSelector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../state/store/store"
import { getDescription, LegendMetric } from "./legendMetric"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const legendColorMetricSelector: (state: CcState) => LegendMetric = createSelector(
	[colorMetricSelector, attributeDescriptorsSelector],
	(colorMetric, attributeDescriptors) => ({
		metricName: colorMetric,
		description: getDescription(colorMetric, attributeDescriptors)
	})
)
