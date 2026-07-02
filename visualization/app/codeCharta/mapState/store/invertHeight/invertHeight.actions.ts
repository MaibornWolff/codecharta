import { createAction, props } from "@ngrx/store"

export const setInvertHeight = createAction("SET_INVERT_HEIGHT", props<{ value: boolean }>())
