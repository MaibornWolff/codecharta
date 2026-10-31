import { createAction, props } from "@ngrx/store"

export const setLocalSourceEnabled = createAction("SET_LOCAL_SOURCE_ENABLED", props<{ value: boolean }>())
