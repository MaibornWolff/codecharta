import { AttributeTypesAction, AttributeTypesActions, setAttributeTypes, UpdateAttributeTypeAction } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
const clone = require("rfdc")()

export function attributeTypes(state: AttributeTypes = setAttributeTypes().payload, action: AttributeTypesAction): AttributeTypes {
	switch (action.type) {
		case AttributeTypesActions.SET_ATTRIBUTE_TYPES:
			return clone(action.payload)
		case AttributeTypesActions.UPDATE_ATTRIBUTE_TYPE:
			return updateAttributeType(state, action)
		default:
			return state
	}
}

function updateAttributeType(state: AttributeTypes, action: UpdateAttributeTypeAction) {
	const copy = clone(state)
	if (copy[action.payload.category]) {
		copy[action.payload.category][action.payload.name] = action.payload.type
	}
	return copy
}
