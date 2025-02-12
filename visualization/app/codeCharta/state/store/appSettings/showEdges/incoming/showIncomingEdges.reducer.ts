import { createReducer, on } from "@ngrx/store"
import { setShowIncomingEdges } from "./showIncomingEdges.actions"
import { setState } from "../../../util/setState.reducer.factory"

export const defaultShowIncomingEdges = true
export const showIncomingEdges = createReducer(defaultShowIncomingEdges, on(setShowIncomingEdges, setState(defaultShowIncomingEdges)))
