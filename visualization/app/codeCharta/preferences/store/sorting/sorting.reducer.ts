import { createReducer, on } from "@ngrx/store"
import { Sorting, SortingOption } from "../../../codeCharta.model"
import { setSortingOption, setSortingOrderAscending, toggleSortingOrderAscending } from "./sorting.actions"

export const defaultSorting: Sorting = { option: SortingOption.NAME, orderAscending: true }
export const sorting = createReducer(
    defaultSorting,
    on(setSortingOption, (state, { value }) => ({ ...state, option: value })),
    on(setSortingOrderAscending, (state, { value }) => ({ ...state, orderAscending: value })),
    on(toggleSortingOrderAscending, state => ({ ...state, orderAscending: !state.orderAscending }))
)
