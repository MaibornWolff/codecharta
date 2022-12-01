import { createSelector } from "../../../state/angular-redux/createSelector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"
import { CcState } from "../../../state/store/store"
import { getLegendMetric, LegendMetric } from "./legendMetric"

export const legendAreaMetricSelector: (state: CcState) => LegendMetric = createSelector(
	[areaMetricSelector, attributeDescriptorsSelector],
	(areaMetric, attributeDescriptors) => getLegendMetric(areaMetric, attributeDescriptors)
)
