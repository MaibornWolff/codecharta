import { createAction, props } from "@ngrx/store"

export const setLabelSize = createAction("SET_LABEL_SIZE", props<{ value: number }>())
