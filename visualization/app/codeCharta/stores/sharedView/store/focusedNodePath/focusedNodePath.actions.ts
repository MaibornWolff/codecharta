import { createAction, props } from "@ngrx/store"

export const setAllFocusedNodes = createAction("SET_ALL_FOCUSED_NODES", props<{ value: string[] }>())
export const focusNode = createAction("FOCUS_NODE", props<{ value: string }>())
export const unfocusNode = createAction("UNFOCUS_NODE")
