import { createReducer, on } from "@ngrx/store"
import { setColorRange } from "./colorRange.actions"

export const colorRange = createReducer(
	{ from: null, to: null },
	on(setColorRange, (state, payload) => ({ ...state, ...payload.value }))
)
