import { createReducer, on } from "@ngrx/store"
import { setEdgeHeight } from "./edgeHeight.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultEdgeHeight = 4
export const edgeHeight = createReducer(defaultEdgeHeight, on(setEdgeHeight, setState(defaultEdgeHeight)))
