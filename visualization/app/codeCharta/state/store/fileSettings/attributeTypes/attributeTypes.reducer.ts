import { AttributeTypesAction, AttributeTypesActions, setAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
const clone = require("rfdc")()

export function attributeTypes(state: AttributeTypes = setAttributeTypes().payload, action: AttributeTypesAction): AttributeTypes {
	switch (action.type) {
		case AttributeTypesActions.SET_ATTRIBUTE_TYPES:
			return clone(action.payload)
		default:
			return state
	}
}
