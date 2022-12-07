import { AttributeDescriptorsAction, AttributeDescriptorsActions, setAttributeDescriptors } from "./attributeDescriptors.action"

export function attributeDescriptors(state = setAttributeDescriptors().payload, action: AttributeDescriptorsAction) {
	if (action.type === AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS) {
		return action.payload
	}
	return state
}
