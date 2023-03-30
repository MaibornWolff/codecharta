import { createReducer, on } from "@ngrx/store"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export const amountOfEdgePreviews = createReducer(
	1,
	on(setAmountOfEdgePreviews, (_state, payload) => payload.value)
)
