import { ResetCameraIfNewFileIsLoadedAction, setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

export function splitResetCameraIfNewFileIsLoadedAction(payload: boolean): ResetCameraIfNewFileIsLoadedAction {
	return setResetCameraIfNewFileIsLoaded(payload)
}
