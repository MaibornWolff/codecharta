import { createReducer, on } from "@ngrx/store"
import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

export const resetCameraIfNewFileIsLoaded = createReducer(
	true,
	on(setResetCameraIfNewFileIsLoaded, (_state, payload) => payload.value)
)
