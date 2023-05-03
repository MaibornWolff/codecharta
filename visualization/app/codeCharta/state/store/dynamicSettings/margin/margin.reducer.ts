import { createReducer, on } from "@ngrx/store"
import { setMargin } from "./margin.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultMargin = 50
export const margin = createReducer(defaultMargin, on(setMargin, setState(defaultMargin)))
