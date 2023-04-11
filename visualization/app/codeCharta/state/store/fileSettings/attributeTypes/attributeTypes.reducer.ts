import { setAttributeTypes, updateAttributeType } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
import { createReducer, on } from "@ngrx/store"

export const defaultAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const attributeTypes = createReducer(
	defaultAttributeTypes,
	on(setAttributeTypes, (_state, action) => action.value),
	on(updateAttributeType, (state, action) => ({
		...state,
		[action.category]: { ...state[action.category], [action.name]: action.attributeType }
	}))
)
