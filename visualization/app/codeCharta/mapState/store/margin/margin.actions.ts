import { createAction, props } from "@ngrx/store"

export const setMargin = createAction("SET_MARGIN", props<{ value: number }>())
