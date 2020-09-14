import { setResetCameraIfNewFileIsLoaded } from "./resetCameraIfNewFileIsLoaded.actions"

export function splitResetCameraIfNewFileIsLoadedAction(payload: boolean) {
	return setResetCameraIfNewFileIsLoaded(payload)
}
