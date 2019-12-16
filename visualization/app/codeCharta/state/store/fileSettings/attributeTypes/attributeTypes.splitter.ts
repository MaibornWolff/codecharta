import { AttributeTypesAction, setAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"

export function splitAttributeTypesAction(payload: AttributeTypes): AttributeTypesAction {
	return setAttributeTypes(payload)
}
