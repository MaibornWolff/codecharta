import { createReducer, on } from "@ngrx/store"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "./colorMode.actions"

export const colorMode = createReducer(
	ColorMode.weightedGradient,
	on(setColorMode, (_state, payload) => payload.value)
)
