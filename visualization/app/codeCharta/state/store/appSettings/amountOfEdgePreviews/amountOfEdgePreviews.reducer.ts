import { createReducer, on } from "@ngrx/store"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultAmountOfEdgesPreviews = 1
export const amountOfEdgePreviews = createReducer(
	defaultAmountOfEdgesPreviews,
	on(setAmountOfEdgePreviews, setState(defaultAmountOfEdgesPreviews))
)
