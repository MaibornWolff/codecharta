import { createReducer, on } from "@ngrx/store"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "./colorMode.actions"

export const defaultColorMode = ColorMode.weightedGradient
export const colorMode = createReducer(
	defaultColorMode,
	on(setColorMode, (_state, payload) => payload.value)
)
