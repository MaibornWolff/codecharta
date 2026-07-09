import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

export const defaultResetCameraIfNewFileIsLoaded = true
export const resetCameraIfNewFileIsLoaded = createReducer(
    defaultResetCameraIfNewFileIsLoaded,
    on(setResetCameraIfNewFileIsLoaded, setState(defaultResetCameraIfNewFileIsLoaded))
)
