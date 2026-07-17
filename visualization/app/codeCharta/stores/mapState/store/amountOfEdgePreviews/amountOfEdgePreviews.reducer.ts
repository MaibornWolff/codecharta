import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setAmountOfEdgePreviews } from "./amountOfEdgePreviews.actions"

export const defaultAmountOfEdgesPreviews = 1
export const amountOfEdgePreviews = createReducer(
    defaultAmountOfEdgesPreviews,
    on(setAmountOfEdgePreviews, setState(defaultAmountOfEdgesPreviews))
)
