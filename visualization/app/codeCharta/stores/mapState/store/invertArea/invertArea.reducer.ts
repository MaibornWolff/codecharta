import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setInvertArea } from "./invertArea.actions"

export const defaultInvertArea = false
export const invertArea = createReducer(defaultInvertArea, on(setInvertArea, setState(defaultInvertArea)))
