import { createAction, props } from "@ngrx/store"

export const setInvertArea = createAction("SET_INVERT_AREA", props<{ value: boolean }>())
