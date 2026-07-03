import { createReducer, on } from "@ngrx/store"
import { Sorting, SortingOption } from "../../../codeCharta.model"
import { setSortingOption, setSortingOrderAscending, toggleSortingOrderAscending } from "./sorting.actions"

export const defaultSorting: Sorting = { option: SortingOption.NAME, orderAscending: true }
// Each set-action resets its field to the default on an undefined payload, exactly as the setState
// reducer factory did for the two pre-merge reducers (setState.reducer.factory) — an undefined value
// resets, a null value passes through unchanged.
export const sorting = createReducer(
    defaultSorting,
    on(setSortingOption, (state, { value }) => ({ ...state, option: value === undefined ? defaultSorting.option : value })),
    on(setSortingOrderAscending, (state, { value }) => ({
        ...state,
        orderAscending: value === undefined ? defaultSorting.orderAscending : value
    })),
    on(toggleSortingOrderAscending, state => ({ ...state, orderAscending: !state.orderAscending }))
)
