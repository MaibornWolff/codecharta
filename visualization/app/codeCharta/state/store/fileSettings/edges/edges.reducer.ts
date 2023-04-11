import { addEdge, removeEdge, setEdges } from "./edges.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import { createReducer, on } from "@ngrx/store"
import { Edge } from "../../../../codeCharta.model"

export const defaultEdges: Edge[] = []
export const edges = createReducer(
	defaultEdges,
	on(setEdges, (_state, action) => action.value),
	on(addEdge, (state, action) => addItemToArray(state, action.edge)),
	on(removeEdge, (state, action) => removeItemFromArray(state, action.edge))
)
