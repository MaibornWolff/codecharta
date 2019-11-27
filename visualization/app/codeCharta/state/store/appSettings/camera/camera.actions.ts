import { Action } from "redux"
import { Vector3 } from "three"

export enum CameraActions {
	SET_CAMERA = "SET_CAMERA"
}

export interface SetCameraAction extends Action {
	type: CameraActions.SET_CAMERA
	payload: Vector3
}

export type CameraAction = SetCameraAction

export function setCamera(camera: Vector3): CameraAction {
	return {
		type: CameraActions.SET_CAMERA,
		payload: camera
	}
}
