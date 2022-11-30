import { AttributeDescriptors, CCAction } from "../../../../codeCharta.model"

export enum AttributeDescriptorsActions {
	SET_ATTRIBUTE_DESCRIPTORS = "SET_ATTRIBUTE_DESCRIPTORS"
}

export interface SetAttributeDescriptorsAction extends CCAction {
	type: AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS
	payload: AttributeDescriptors
}

export type AttributeDescriptorsAction = SetAttributeDescriptorsAction

export function setAttributeDescriptors(
	attributeDescriptors: AttributeDescriptors = defaultAttributeDescriptors
): SetAttributeDescriptorsAction {
	return {
		type: AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS,
		payload: attributeDescriptors
	}
}

export const defaultAttributeDescriptors: AttributeDescriptors = {
	DefaultAttributeDescriptor: {
		title: "Default Attribute Descriptor",
		description: "The default Attribute Descriptor that is generated at the beginning.",
		hintLowValue: "",
		hintHighValue: "",
		link: "./app/codeCharta/state/store/fileSettings/attributeDescriptors/attributeDescriptors.action.ts"
	}
}
