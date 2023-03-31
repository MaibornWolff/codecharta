import { createReducer, on } from "@ngrx/store"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"

export const defaultSortingOrderAscending = true
export const sortingOrderAscending = createReducer(
	defaultSortingOrderAscending,
	on(setSortingOrderAscending, (_state, payload) => payload.value),
	on(toggleSortingOrderAscending, state => !state)
)
