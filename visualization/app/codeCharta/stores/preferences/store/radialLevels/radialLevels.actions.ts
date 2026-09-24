import { createAction, props } from "@ngrx/store"

export const setRadialLevels = createAction("SET_RADIAL_LEVELS", props<{ value: number }>())
