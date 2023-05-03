import { createAction, props } from "@ngrx/store"

export const setHoveredNodeId = createAction("SET_HOVERED_NODE_ID", props<{ value: null | number }>())
