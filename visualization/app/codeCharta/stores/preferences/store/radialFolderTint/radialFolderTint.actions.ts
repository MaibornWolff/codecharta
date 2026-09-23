import { createAction, props } from "@ngrx/store"

export const setRadialFolderTint = createAction("SET_RADIAL_FOLDER_TINT", props<{ value: number }>())
