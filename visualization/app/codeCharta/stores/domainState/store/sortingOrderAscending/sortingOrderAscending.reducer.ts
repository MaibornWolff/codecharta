import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateSortingOrderAscending } from "./sortingOrderAscending.actions"

export const defaultSortingOrderAscending: boolean = true
// Explicit State generic so the slice stays `boolean`, not the `true` literal.
export const sortingOrderAscending = createReducer<boolean>(
    defaultSortingOrderAscending,
    on(setDomainStateSortingOrderAscending, setState(defaultSortingOrderAscending))
)
