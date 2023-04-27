import { createReducer, on } from "@ngrx/store"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "./colorMode.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultColorMode = ColorMode.weightedGradient
export const colorMode = createReducer(defaultColorMode, on(setColorMode, setState(defaultColorMode)))
