import { createAction, props } from "@ngrx/store"

export const setDomainStateSearchPattern = createAction("SET_DOMAIN_STATE_SEARCH_PATTERN", props<{ value: string }>())
