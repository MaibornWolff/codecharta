import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../state/store/util/setState.reducer.factory"
import { setShowOutgoingEdges } from "./showOutgoingEdges.actions"

export const defaultShowOutgoingEdges = true
export const showOutgoingEdges = createReducer(defaultShowOutgoingEdges, on(setShowOutgoingEdges, setState(defaultShowOutgoingEdges)))
