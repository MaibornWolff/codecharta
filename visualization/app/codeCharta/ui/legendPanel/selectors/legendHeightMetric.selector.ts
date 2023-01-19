import { createSelector } from "../../../state/angular-redux/createSelector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { CcState } from "../../../state/store/store"
import { getMetricDecorations, MetricDecorations } from "../../attributeSideBar/util/metricDecorations"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"

export const legendHeightMetricSelector: (state: CcState) => MetricDecorations = createSelector(
	[heightMetricSelector, attributeDescriptorsSelector],
	(heightMetric, attributeDescriptors) => getMetricDecorations(heightMetric, attributeDescriptors)
)
