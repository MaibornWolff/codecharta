import { createAction, props } from "@ngrx/store"

export const setLocalFolderPath = createAction("SET_LOCAL_FOLDER_PATH", props<{ value: string }>())
