import { createAction, props } from "@ngrx/store"

export const setDomainStateSortingOrderAscending = createAction("SET_DOMAIN_STATE_SORTING_ORDER_ASCENDING", props<{ value: boolean }>())
