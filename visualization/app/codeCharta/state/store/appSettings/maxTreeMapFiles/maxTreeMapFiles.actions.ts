import { createAction, props } from "@ngrx/store"

export const setMaxTreeMapFiles = createAction("SET_MAX_TREE_MAP_FILES", props<{ value: number }>())
