import { createReducer, on } from "@ngrx/store"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSortingOrderAscending = true
export const sortingOrderAscending = createReducer(
	defaultSortingOrderAscending,
	on(setSortingOrderAscending, setState(defaultSortingOrderAscending)),
	on(toggleSortingOrderAscending, state => !state)
)
