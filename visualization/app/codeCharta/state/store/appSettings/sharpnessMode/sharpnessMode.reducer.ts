import { createReducer, on } from "@ngrx/store"
import { SharpnessMode } from "../../../../codeCharta.model"
import { setSharpnessMode } from "./sharpnessMode.actions"

export const defaultSharpnessMode = SharpnessMode.Standard
export const sharpnessMode = createReducer(
	defaultSharpnessMode,
	on(setSharpnessMode, (_state, payload) => payload.value)
)
