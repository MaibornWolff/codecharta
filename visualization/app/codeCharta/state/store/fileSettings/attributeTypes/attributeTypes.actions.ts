import { AttributeTypes, CCAction } from "../../../../model/codeCharta.model"

export enum AttributeTypesActions {
	SET_ATTRIBUTE_TYPES = "SET_ATTRIBUTE_TYPES"
}

export interface SetAttributeTypesAction extends CCAction {
	type: AttributeTypesActions.SET_ATTRIBUTE_TYPES
	payload: AttributeTypes
}

export type AttributeTypesAction = SetAttributeTypesAction

export function setAttributeTypes(attributeTypes: AttributeTypes = defaultAttributeTypes): AttributeTypesAction {
	return {
		type: AttributeTypesActions.SET_ATTRIBUTE_TYPES,
		payload: attributeTypes
	}
}

export const defaultAttributeTypes: AttributeTypes = { nodes: [], edges: [] }
