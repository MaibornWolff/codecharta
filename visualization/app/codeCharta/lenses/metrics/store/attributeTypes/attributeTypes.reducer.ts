import { setAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../codeCharta.model"
import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../state/store/util/setState.reducer.factory"

export const defaultAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const attributeTypes = createReducer(defaultAttributeTypes, on(setAttributeTypes, setState(defaultAttributeTypes)))
