import { createSelector } from "../../../state/angular-redux/createSelector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { CcState } from "../../../state/store/store"
import { getShortDescription, LegendMetric } from "./legendMetric"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const legendHeightMetricSelector: (state: CcState) => LegendMetric = createSelector(
	[heightMetricSelector, attributeDescriptorsSelector],
	(heightMetric, attributeDescriptors) => ({
		metricName: heightMetric,
		description: getShortDescription(heightMetric, attributeDescriptors)
	})
)
