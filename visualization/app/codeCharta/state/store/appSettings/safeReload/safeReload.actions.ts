import { createAction, props } from "@ngrx/store"

export const setSafeReload = createAction("SET_SAFE_RELOAD", props<{ value: boolean }>())
