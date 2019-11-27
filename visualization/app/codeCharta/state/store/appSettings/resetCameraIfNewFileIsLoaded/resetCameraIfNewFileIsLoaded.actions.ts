import { Action } from "redux"

export enum ResetCameraIfNewFileIsLoadedActions {
	SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED = "SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED"
}

export interface SetResetCameraIfNewFileIsLoadedAction extends Action {
	type: ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED
	payload: boolean
}

export type ResetCameraIfNewFileIsLoadedAction = SetResetCameraIfNewFileIsLoadedAction

export function setResetCameraIfNewFileIsLoaded(resetCameraIfNewFileIsLoaded: boolean): ResetCameraIfNewFileIsLoadedAction {
	return {
		type: ResetCameraIfNewFileIsLoadedActions.SET_RESET_CAMERA_IF_NEW_FILE_IS_LOADED,
		payload: resetCameraIfNewFileIsLoaded
	}
}
