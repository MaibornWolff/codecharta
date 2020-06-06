import { AttributeTypes, CCAction, AttributeTypeValue } from "../../../../codeCharta.model"

export enum AttributeTypesActions {
	SET_ATTRIBUTE_TYPES = "SET_ATTRIBUTE_TYPES",
	UPDATE_ATTRIBUTE_TYPE = "UPDATE_ATTRIBUTE_TYPE"
}

export interface SetAttributeTypesAction extends CCAction {
	type: AttributeTypesActions.SET_ATTRIBUTE_TYPES
	payload: AttributeTypes
}

export interface UpdateAttributeTypeAction extends CCAction {
	type: AttributeTypesActions.UPDATE_ATTRIBUTE_TYPE
	payload: { category: string; name: string; type: AttributeTypeValue }
}

export type AttributeTypesAction = SetAttributeTypesAction | UpdateAttributeTypeAction

export function setAttributeTypes(attributeTypes: AttributeTypes = defaultAttributeTypes): SetAttributeTypesAction {
	return {
		type: AttributeTypesActions.SET_ATTRIBUTE_TYPES,
		payload: attributeTypes
	}
}

export function updateAttributeType(
	category: string,
	name: string,
	type: AttributeTypeValue
): UpdateAttributeTypeAction {
	return {
		type: AttributeTypesActions.UPDATE_ATTRIBUTE_TYPE,
		payload: { category, name, type }
	}
}

export const defaultAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
