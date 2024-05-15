import { addEdge, removeEdge, setEdges } from "./edges.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/arrayHelper"
import { createReducer, on } from "@ngrx/store"
import { Edge } from "../../../../codeCharta.model"
import { setState } from "../../util/setState.reducer.factory"

export const defaultEdges: Edge[] = []
export const edges = createReducer(
    defaultEdges,
    on(setEdges, setState(defaultEdges)),
    on(addEdge, (state, action) => addItemToArray(state, action.edge)),
    on(removeEdge, (state, action) => removeItemFromArray(state, action.edge))
)
