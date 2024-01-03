import { createAction, props } from "@ngrx/store"

export const setIsSearchPanelPinned = createAction("SET_IS_FILE_EXPLORER_PINNED", props<{ value: boolean }>())
export const toggleIsSearchPanelPinned = createAction("TOGGLE_IS_FILE_EXPLORER_PINNED")
