import { createReducer, on } from "@ngrx/store"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

export const defaultResetCameraIfNewFileIsLoaded = true
export const resetCameraIfNewFileIsLoaded = createReducer(
	defaultResetCameraIfNewFileIsLoaded,
	on(setResetCameraIfNewFileIsLoaded, (_state, payload) => payload.value)
)
