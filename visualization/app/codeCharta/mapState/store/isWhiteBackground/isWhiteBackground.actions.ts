import { createAction, props } from "@ngrx/store"

export const setIsWhiteBackground = createAction("SET_IS_WHITE_BACKGROUND", props<{ value: boolean }>())
