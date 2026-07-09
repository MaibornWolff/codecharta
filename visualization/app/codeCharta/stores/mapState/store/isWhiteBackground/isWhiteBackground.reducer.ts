import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setIsWhiteBackground } from "./isWhiteBackground.actions"

export const defaultIsWhiteBackground = false
export const isWhiteBackground = createReducer(defaultIsWhiteBackground, on(setIsWhiteBackground, setState(defaultIsWhiteBackground)))
