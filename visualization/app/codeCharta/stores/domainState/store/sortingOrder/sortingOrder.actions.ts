import { createAction, props } from "@ngrx/store"
import { SortingOption } from "../../../../model/codeCharta.model"

export const setDomainStateSortingOrder = createAction("SET_DOMAIN_STATE_SORTING_ORDER", props<{ value: SortingOption }>())
