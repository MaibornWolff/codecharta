import { ResetCameraIfNewFileIsLoadedAction, ResetCameraIfNewFileIsLoadedActions } from "./resetCameraIfNewFileIsLoaded.actions"

export function resetCameraIfNewFileIsLoaded(state: boolean = true, action: ResetCameraIfNewFileIsLoadedAction): boolean {
	switch (action.type) {
		case ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED:
			return action.payload
		default:
			return state
	}
}
