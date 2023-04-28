import { createAction, props } from "@ngrx/store"

export const setEnableFloorLabels = createAction("SET_ENABLE_FLOOR_LABELS", props<{ value: boolean }>())
