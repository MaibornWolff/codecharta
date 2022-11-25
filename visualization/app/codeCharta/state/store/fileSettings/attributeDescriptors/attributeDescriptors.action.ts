import { AttributeDescriptors, CCAction } from "../../../../codeCharta.model"

export enum AttributeDescriptorsActions {
	SET_ATTRIBUTE_DESCRIPTORS = "SET_ATTRIBUTE_DESCRIPTORS",
	UPDATE_ATTRIBUTE_DESCRIPTOR = "UPDATE_ATTRIBUTE_DESCRIPTOR"
}

export interface SetAttributeDescriptorsAction extends CCAction {
	type: AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS
	payload: AttributeDescriptors
}

export interface UpdateAttributeDescriptorAction extends CCAction {
	type: AttributeDescriptorsActions.UPDATE_ATTRIBUTE_DESCRIPTOR
	payload: { category: string; name: string; type: string }
}

export type AttributeDescriptorsAction = SetAttributeDescriptorsAction | UpdateAttributeDescriptorAction

export function setAttributeDescriptors(
	attributeDescriptors: AttributeDescriptors = defaultAttributeDescriptors
): SetAttributeDescriptorsAction {
	return {
		type: AttributeDescriptorsActions.SET_ATTRIBUTE_DESCRIPTORS,
		payload: attributeDescriptors
	}
}

export function updateAttributeDescriptor(category: string, name: string, type: string): UpdateAttributeDescriptorAction {
	return {
		type: AttributeDescriptorsActions.UPDATE_ATTRIBUTE_DESCRIPTOR,
		payload: { category, name, type }
	}
}

export const defaultAttributeDescriptors: AttributeDescriptors = { test: { testKeyAttrDescrAction36: "testValueAttrDescriptorsAction36" } }
