import { createReducer, on } from "@ngrx/store"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export const defaultAmountOfEdgesPreviews = 1
export const amountOfEdgePreviews = createReducer(
	defaultAmountOfEdgesPreviews,
	on(setAmountOfEdgePreviews, (_state, payload) => payload.value)
)
