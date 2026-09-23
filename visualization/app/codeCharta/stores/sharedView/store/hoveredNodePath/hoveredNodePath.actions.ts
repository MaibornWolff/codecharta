import { createAction, props } from "@ngrx/store"

export const setHoveredNodePath = createAction("SET_HOVERED_NODE_PATH", props<{ value: string | null }>())
