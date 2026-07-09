import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setMargin } from "./margin.actions"

export const defaultMargin = 50
export const margin = createReducer(defaultMargin, on(setMargin, setState(defaultMargin)))
