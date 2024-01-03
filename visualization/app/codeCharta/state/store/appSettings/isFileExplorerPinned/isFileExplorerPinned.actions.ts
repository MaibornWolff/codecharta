import { createAction, props } from "@ngrx/store"

export const setIsFileExplorerPinned = createAction("SET_IS_FILE_EXPLORER_PINNED", props<{ value: boolean }>())
export const toggleIsFileExplorerPinned = createAction("TOGGLE_IS_FILE_EXPLORER_PINNED")
