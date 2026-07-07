import { createReducer, on } from "@ngrx/store"
import { setAttributeDescriptors } from "./attributeDescriptors.action"
import { AttributeDescriptors } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"

export const defaultAttributeDescriptors: AttributeDescriptors = {}
export const attributeDescriptors = createReducer(
    defaultAttributeDescriptors,
    on(setAttributeDescriptors, setState(defaultAttributeDescriptors))
)
