import { createReducer, on } from "@ngrx/store"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"

export const sortingOrderAscending = createReducer(
	true,
	on(setSortingOrderAscending, (_state, payload) => payload.value),
	on(toggleSortingOrderAscending, state => !state)
)
