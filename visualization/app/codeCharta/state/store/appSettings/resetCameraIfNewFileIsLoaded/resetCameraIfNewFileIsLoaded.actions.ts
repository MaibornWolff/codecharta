import { createAction, props } from "@ngrx/store"

export const setResetCameraIfNewFileIsLoaded = createAction("SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED", props<{ value: boolean }>())
