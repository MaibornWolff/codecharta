import { createReducer, on } from "@ngrx/store"
import { AttributeDescriptors } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setAttributeDescriptors } from "./attributeDescriptors.action"

export const defaultAttributeDescriptors: AttributeDescriptors = {}
export const attributeDescriptors = createReducer(
    defaultAttributeDescriptors,
    on(setAttributeDescriptors, setState(defaultAttributeDescriptors))
)
