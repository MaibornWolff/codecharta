import { createReducer, on } from "@ngrx/store"
import { SortingOption } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainStateSortingOrder } from "./sortingOrder.actions"

export const defaultSortingOrder: SortingOption = SortingOption.NAME
export const sortingOrder = createReducer<SortingOption>(defaultSortingOrder, on(setDomainStateSortingOrder, setState(defaultSortingOrder)))
