import { Action } from "redux"
import { AttributeTypes } from "../../../../codeCharta.model"

export enum AttributeTypesActions {
	SET_ATTRIBUTE_TYPES = "SET_ATTRIBUTE_TYPES"
}

export interface SetAttributeTypesAction extends Action {
	type: AttributeTypesActions.SET_ATTRIBUTE_TYPES
	payload: AttributeTypes
}

export type AttributeTypesAction = SetAttributeTypesAction

export function setAttributeTypes(attributeTypes: AttributeTypes): AttributeTypesAction {
	return {
		type: AttributeTypesActions.SET_ATTRIBUTE_TYPES,
		payload: attributeTypes
	}
}
