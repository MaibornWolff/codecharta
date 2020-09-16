import { setAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"

export function splitAttributeTypesAction(payload: AttributeTypes) {
	return setAttributeTypes(payload)
}
