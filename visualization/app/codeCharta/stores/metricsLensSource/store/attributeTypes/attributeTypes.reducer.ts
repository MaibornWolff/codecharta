import { createReducer, on } from "@ngrx/store"
import { AttributeTypes } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setAttributeTypes } from "./attributeTypes.actions"

export const defaultAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const attributeTypes = createReducer(defaultAttributeTypes, on(setAttributeTypes, setState(defaultAttributeTypes)))
