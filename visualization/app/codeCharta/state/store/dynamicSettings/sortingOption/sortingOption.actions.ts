import { createAction, props } from "@ngrx/store"
import { SortingOption } from "../../../../codeCharta.model"

export const setSortingOption = createAction("SET_SORTING_OPTION", props<{ value: SortingOption }>())
