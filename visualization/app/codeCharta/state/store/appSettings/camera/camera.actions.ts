import { Vector3 } from "three"
import { CCAction } from "../../../../codeCharta.model"
import { Action } from "redux"

export enum CameraActions {
	SET_CAMERA = "SET_CAMERA",
	SET_DEFAULT = "SET_DEFAULT"
}

export interface SetDefaultCameraAction extends Action {
	type: CameraActions.SET_DEFAULT
}

export interface SetCameraAction extends CCAction {
	type: CameraActions.SET_CAMERA
	payload: Vector3
}

export type CameraAction = SetCameraAction | SetDefaultCameraAction

export function setCamera(camera: Vector3): CameraAction {
	return {
		type: CameraActions.SET_CAMERA,
		payload: camera
	}
}

export function setDefaultCamera(): CameraAction {
	return {
		type: CameraActions.SET_DEFAULT
	}
}
