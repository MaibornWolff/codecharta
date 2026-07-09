import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setEdgeHeight } from "./edgeHeight.actions"

export const defaultEdgeHeight = 4
export const edgeHeight = createReducer(defaultEdgeHeight, on(setEdgeHeight, setState(defaultEdgeHeight)))
