import { createReducer, on } from "@ngrx/store"
import { setInvertArea } from "./invertArea.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultInvertArea = false
export const invertArea = createReducer(defaultInvertArea, on(setInvertArea, setState(defaultInvertArea)))
