import { createSelector } from "../../../angular-redux/createSelector"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { visibleFileStatesSelector } from "../../visibleFileStates.selector"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"
import { calculateNodeMetricData } from "./nodeMetricData.calculator"
import { attributeDescriptorsSelector } from "../../../store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

export const metricDataSelector = createSelector(
	[visibleFileStatesSelector, blacklistSelector, attributeDescriptorsSelector],
	(visibleFileStates, blacklist, attributeDescriptors) => {
		return {
			nodeMetricData: calculateNodeMetricData(visibleFileStates, blacklist, attributeDescriptors),
			...calculateEdgeMetricData(visibleFileStates, blacklist, attributeDescriptors)
		}
	}
)
