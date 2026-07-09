import { createReducer, on } from "@ngrx/store"
import { AttributeTypes } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setEdgeAttributeTypes } from "./attributeTypes.actions"

export const defaultEdgeAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const edgeAttributeTypes = createReducer(defaultEdgeAttributeTypes, on(setEdgeAttributeTypes, setState(defaultEdgeAttributeTypes)))
