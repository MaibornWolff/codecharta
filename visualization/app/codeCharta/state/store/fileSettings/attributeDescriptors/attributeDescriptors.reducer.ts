import { createReducer, on } from "@ngrx/store"
import { setAttributeDescriptors } from "./attributeDescriptors.action"
import { AttributeDescriptors } from "../../../../codeCharta.model"

export const defaultAttributeDescriptors: AttributeDescriptors = {}
export const attributeDescriptors = createReducer(
	defaultAttributeDescriptors,
	on(setAttributeDescriptors, (_state, payload) => payload.value)
)
