import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../../util/setState.reducer.factory"
import { setShowIncomingEdges } from "./showIncomingEdges.actions"

export const defaultShowIncomingEdges = true
export const showIncomingEdges = createReducer(defaultShowIncomingEdges, on(setShowIncomingEdges, setState(defaultShowIncomingEdges)))
