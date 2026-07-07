import { setEdgeAttributeTypes } from "./attributeTypes.actions"
import { AttributeTypes } from "../../../../model/codeCharta.model"
import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"

export const defaultEdgeAttributeTypes: AttributeTypes = { nodes: {}, edges: {} }
export const edgeAttributeTypes = createReducer(defaultEdgeAttributeTypes, on(setEdgeAttributeTypes, setState(defaultEdgeAttributeTypes)))
