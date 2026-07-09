import { createReducer, on } from "@ngrx/store"
import { ColorMode } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setColorMode } from "./colorMode.actions"

export const defaultColorMode = ColorMode.weightedGradient
export const colorMode = createReducer(defaultColorMode, on(setColorMode, setState(defaultColorMode)))
