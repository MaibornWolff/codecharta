import { AttributeTypesAction, AttributeTypesActions, setAttributeTypes, UpdateAttributeTypeAction } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
import { clone } from "../../../../util/clone"

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

function updateAttributeType(state: AttributeTypes, action: UpdateAttributeTypeAction): AttributeTypes {
	return {
		...state,
		[action.payload.category]: { ...state[action.payload.category], [action.payload.name]: action.payload.type }
	}
}
