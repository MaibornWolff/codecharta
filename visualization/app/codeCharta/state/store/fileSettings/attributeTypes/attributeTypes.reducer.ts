import { AttributeTypesAction, AttributeTypesActions, setAttributeTypes, UpdateAttributeTypeAction } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"

export function attributeTypes(state = setAttributeTypes().payload, action: AttributeTypesAction) {
	switch (action.type) {
		case AttributeTypesActions.SET_ATTRIBUTE_TYPES:
			return action.payload
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
