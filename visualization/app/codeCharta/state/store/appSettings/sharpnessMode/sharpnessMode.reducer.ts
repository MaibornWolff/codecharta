import { createReducer, on } from "@ngrx/store"
import { SharpnessMode } from "../../../../codeCharta.model"
import { setSharpnessMode } from "./sharpnessMode.actions"

export const sharpnessMode = createReducer(
	SharpnessMode.Standard,
	on(setSharpnessMode, (_state, payload) => payload.value)
)
