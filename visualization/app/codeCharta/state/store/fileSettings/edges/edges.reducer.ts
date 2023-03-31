import { addEdge, removeEdge, setEdges } from "./edges.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import { createReducer, on } from "@ngrx/store"
import { Edge } from "../../../../codeCharta.model"

export const defaultEdges: Edge[] = []
export const edges = createReducer(
	defaultEdges,
	on(setEdges, (_state, payload) => payload.value),
	on(addEdge, (state, payload) => addItemToArray(state, payload.edge)),
	on(removeEdge, (state, payload) => removeItemFromArray(state, payload.edge))
)
