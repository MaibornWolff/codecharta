import { createAction, props } from "@ngrx/store"

export const setEdgeHeight = createAction("SET_EDGE_HEIGHT", props<{ value: number }>())
