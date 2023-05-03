import { createAction, props } from "@ngrx/store"
import { Edge } from "../../../../codeCharta.model"

export const setEdges = createAction("SET_EDGES", props<{ value: Edge[] }>())
export const addEdge = createAction("ADD_EDGE", props<{ edge: Edge }>())
export const removeEdge = createAction("REMOVE_EDGE", props<{ edge: Edge }>())
