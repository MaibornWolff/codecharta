import { createAction, props } from "@ngrx/store"

export const setSortingOrderAscending = createAction("SET_SORTING_ORDER_ASCENDING", props<{ value: boolean }>())
export const toggleSortingOrderAscending = createAction("TOGGLE_SORTING_ORDER_ASCENDING")
