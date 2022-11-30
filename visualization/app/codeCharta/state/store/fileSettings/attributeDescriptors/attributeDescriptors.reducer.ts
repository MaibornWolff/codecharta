import { AttributeDescriptorsAction, AttributeDescriptorsActions, setAttributeDescriptors } from "./attributeDescriptors.action"

export function attributeDescriptors(state = setAttributeDescriptors().payload, action: AttributeDescriptorsAction) {
	switch (action.type) {
		case AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS:
			return action.payload
		default:
			return state
	}
}
