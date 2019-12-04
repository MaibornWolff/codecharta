import { Vector3 } from "three"
import { CCAction } from "../../../../codeCharta.model"

export enum CameraActions {
	SET_CAMERA = "SET_CAMERA"
}

export interface SetCameraAction extends CCAction {
	type: CameraActions.SET_CAMERA
	payload: Vector3
}

export type CameraAction = SetCameraAction

export function setCamera(camera: Vector3 = new Vector3(0, 300, 1000)): SetCameraAction {
	return {
		type: CameraActions.SET_CAMERA,
		payload: camera
	}
}
