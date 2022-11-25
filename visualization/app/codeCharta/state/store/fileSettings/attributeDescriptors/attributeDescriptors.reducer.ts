import {
	AttributeDescriptorsAction,
	AttributeDescriptorsActions,
	setAttributeDescriptors,
	UpdateAttributeDescriptorAction
} from "./attributeDescriptors.action"
import { AttributeDescriptors } from "../../../../codeCharta.model"

export function attributeDescriptors(state = setAttributeDescriptors().payload, action: AttributeDescriptorsAction) {
	switch (action.type) {
		case AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS:
			return action.payload
		case AttributeDescriptorsActions.UPDATE_ATTRIBUTE_DESCRIPTOR:
			return updateAttributeDescriptor(state, action)
		default:
			return state
	}
}

function updateAttributeDescriptor(state: AttributeDescriptors, action: UpdateAttributeDescriptorAction): AttributeDescriptors {
	return {
		...state,
		[action.payload.category]: { ...state[action.payload.category], [action.payload.name]: action.payload.type }
	}
}
