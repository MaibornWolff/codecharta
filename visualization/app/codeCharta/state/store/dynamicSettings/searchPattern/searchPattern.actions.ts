import { createAction, props } from "@ngrx/store"

export const setSearchPattern = createAction("SET_SEARCH_PATTERN", props<{ value: string }>())
