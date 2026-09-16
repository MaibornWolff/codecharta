import { createAction, props } from "@ngrx/store"

export const setCenterMapZoom = createAction("SET_CENTER_MAP_ZOOM", props<{ value: number }>())
