import { createAction, props } from "@ngrx/store"

export const keepHighlight = createAction("KEEP_HIGHLIGHT", props<{ paths: string[] }>())
export const removeKeptHighlight = createAction("REMOVE_KEPT_HIGHLIGHT", props<{ paths: string[] }>())
export const clearKeptHighlight = createAction("CLEAR_KEPT_HIGHLIGHT")
