import { createReducer, on } from "@ngrx/store"
import { setPresentationMode } from "./isPresentationMode.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultIsPresentationMode = false
export const isPresentationMode = createReducer(defaultIsPresentationMode, on(setPresentationMode, setState(defaultIsPresentationMode)))
