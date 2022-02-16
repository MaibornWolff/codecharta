import { createSelector } from "../angular-redux/store"
import { attributeTypesSelector } from "../store/fileSettings/attributeTypes/attributeTypes.selector"
import { CcState } from "../store/store"
import { AttributeTypeValue } from "../../codeCharta.model"

export type GetAttributeTypeOfNodesByMetric = (metricName: string) => AttributeTypeValue

export const getAttributeTypeOfNodesByMetricSelector: (state: CcState) => GetAttributeTypeOfNodesByMetric = createSelector(
	[attributeTypesSelector],
	attributeTypes => (metricName: string) => attributeTypes.nodes[metricName]
)
