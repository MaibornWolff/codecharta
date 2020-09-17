import {
	ResetCameraIfNewFileIsLoadedAction,
	ResetCameraIfNewFileIsLoadedActions,
	setResetCameraIfNewFileIsLoaded
} from "./resetCameraIfNewFileIsLoaded.actions"

export function resetCameraIfNewFileIsLoaded(
	state = setResetCameraIfNewFileIsLoaded().payload,
	action: ResetCameraIfNewFileIsLoadedAction
) {
	switch (action.type) {
		case ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED:
			return action.payload
		default:
			return state
	}
}
