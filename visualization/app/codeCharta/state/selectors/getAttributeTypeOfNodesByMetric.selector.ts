import { createSelector } from "../angular-redux/store"
import { attributeTypesSelector } from "../store/fileSettings/attributeTypes/attributeTypes.selector"
import { CcState } from "../store/store"
import { AttributeTypes, AttributeTypeValue } from "../../codeCharta.model"

export type GetAttributeType = (metricType: keyof AttributeTypes, metricName: string) => AttributeTypeValue

export const getAttributeTypeSelector: (state: CcState) => GetAttributeType = createSelector(
	[attributeTypesSelector],
	attributeTypes => (metricType, metricName) => attributeTypes[metricType][metricName]
)
