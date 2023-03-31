import { createReducer, on } from "@ngrx/store"
import { setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"

export const defaultColorRange: ColorRange = { from: null, to: null }
export const colorRange = createReducer(
	defaultColorRange,
	on(setColorRange, (state, payload) => ({ ...state, ...payload.value }))
)
