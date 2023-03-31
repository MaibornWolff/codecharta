import { setAttributeTypes, updateAttributeType } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
import { createReducer, on } from "@ngrx/store"

export const defaultAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const attributeTypes = createReducer(
	defaultAttributeTypes,
	on(setAttributeTypes, (_state, payload) => payload.value),
	on(updateAttributeType, (state, payload) => ({
		...state,
		[payload.category]: { ...state[payload.category], [payload.name]: payload.attributeType }
	}))
)
