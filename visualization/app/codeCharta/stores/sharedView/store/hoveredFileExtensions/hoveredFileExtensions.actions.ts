import { createAction, props } from "@ngrx/store"

export const setHoveredFileExtensions = createAction("SET_HOVERED_FILE_EXTENSIONS", props<{ value: string[] }>())
