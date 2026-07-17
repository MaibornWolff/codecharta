import { createAction, props } from "@ngrx/store"

export const setHideFlatBuildings = createAction("SET_HIDE_FLAT_BUILDINGS", props<{ value: boolean }>())
