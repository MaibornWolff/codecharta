import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setPresentationMode } from "./isPresentationMode.actions"

export const defaultIsPresentationMode = false
export const isPresentationMode = createReducer(defaultIsPresentationMode, on(setPresentationMode, setState(defaultIsPresentationMode)))
