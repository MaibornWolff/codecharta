import { createAction, props } from "@ngrx/store"

export const setLabelsPerMap = createAction("SET_LABELS_PER_MAP", props<{ value: boolean }>())
