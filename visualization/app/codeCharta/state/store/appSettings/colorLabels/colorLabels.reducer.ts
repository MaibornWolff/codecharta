import { createReducer, on } from "@ngrx/store"
import { setColorLabels } from "./colorLabels.actions"

export const colorLabels = createReducer(
	{ positive: false, negative: false, neutral: false },
	on(setColorLabels, (state, payload) => ({ ...state, ...payload.value }))
)
