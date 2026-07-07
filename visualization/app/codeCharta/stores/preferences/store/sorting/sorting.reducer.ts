import { createReducer, on } from "@ngrx/store"
import { Sorting, SortingOption } from "../../../../model/codeCharta.model"
import { setSortingOption, toggleSortingOrderAscending } from "./sorting.actions"

export const defaultSorting: Sorting = { option: SortingOption.NAME, orderAscending: true }
// setSortingOption resets its field to the default on an undefined payload, exactly as the setState
// reducer factory did for the pre-merge reducer (setState.reducer.factory) — an undefined value
// resets, a null value passes through unchanged. Sort order is only ever toggled at runtime.
export const sorting = createReducer(
    defaultSorting,
    on(setSortingOption, (state, { value }) => ({ ...state, option: value === undefined ? defaultSorting.option : value })),
    on(toggleSortingOrderAscending, state => ({ ...state, orderAscending: !state.orderAscending }))
)
