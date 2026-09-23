import { createAction, props } from "@ngrx/store"

export const setSelectedNodePath = createAction("SET_SELECTED_NODE_PATH", props<{ value: string | null }>())
