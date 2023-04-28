import { createReducer, on } from "@ngrx/store"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultResetCameraIfNewFileIsLoaded = true
export const resetCameraIfNewFileIsLoaded = createReducer(
	defaultResetCameraIfNewFileIsLoaded,
	on(setResetCameraIfNewFileIsLoaded, setState(defaultResetCameraIfNewFileIsLoaded))
)
