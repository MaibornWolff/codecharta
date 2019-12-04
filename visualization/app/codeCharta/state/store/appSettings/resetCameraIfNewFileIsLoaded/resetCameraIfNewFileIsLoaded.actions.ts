import { CCAction } from "../../../../codeCharta.model"

export enum ResetCameraIfNewFileIsLoadedActions {
	SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED = "SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED"
}

export interface SetResetCameraIfNewFileIsLoadedAction extends CCAction {
	type: ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED
	payload: boolean
}

export type ResetCameraIfNewFileIsLoadedAction = SetResetCameraIfNewFileIsLoadedAction

export function setResetCameraIfNewFileIsLoaded(resetCameraIfNewFileIsLoaded: boolean = true): ResetCameraIfNewFileIsLoadedAction {
	return {
		type: ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED,
		payload: resetCameraIfNewFileIsLoaded
	}
}
