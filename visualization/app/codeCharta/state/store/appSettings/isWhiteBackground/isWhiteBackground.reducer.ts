import { createReducer, on } from "@ngrx/store"
import { setIsWhiteBackground } from "./isWhiteBackground.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultIsWhiteBackground = false
export const isWhiteBackground = createReducer(defaultIsWhiteBackground, on(setIsWhiteBackground, setState(defaultIsWhiteBackground)))
