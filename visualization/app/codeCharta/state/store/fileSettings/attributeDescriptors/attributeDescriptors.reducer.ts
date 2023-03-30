import { createReducer, on } from "@ngrx/store"
import { setAttributeDescriptors } from "./attributeDescriptors.action"

export const attributeDescriptors = createReducer(
	{},
	on(setAttributeDescriptors, (_state, payload) => payload.value)
)
