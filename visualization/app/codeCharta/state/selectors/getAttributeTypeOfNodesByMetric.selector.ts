import { createSelector } from "../angular-redux/store"
import { attributeTypesSelector } from "../store/fileSettings/attributeTypes/attributeTypes.selector"

export const getAttributeTypeOfNodesByMetricSelector = createSelector(
	[attributeTypesSelector],
	attributeTypes => (metricName: string) => attributeTypes.nodes[metricName]
)
