import { createReducer, on } from "@ngrx/store"
import { AttributeTypeMap } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setEdgeAttributeTypes } from "./attributeTypes.actions"

export const defaultEdgeAttributeTypes: AttributeTypeMap = {}
export const edgeAttributeTypes = createReducer(defaultEdgeAttributeTypes, on(setEdgeAttributeTypes, setState(defaultEdgeAttributeTypes)))
