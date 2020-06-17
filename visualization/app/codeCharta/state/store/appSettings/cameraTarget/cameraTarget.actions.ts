import { Vector3 } from "three"
import { CCAction } from "../../../../codeCharta.model"

export enum CameraTargetActions {
	SET_CAMERA_TARGET = "SET_CAMERA_TARGET"
}

export interface SetCameraTargetAction extends CCAction {
	type: CameraTargetActions.SET_CAMERA_TARGET
	payload: Vector3
}

export type CameraTargetAction = SetCameraTargetAction

export function setCameraTarget(cameraTarget: Vector3 = defaultCameraTarget): SetCameraTargetAction {
	return {
		type: CameraTargetActions.SET_CAMERA_TARGET,
		payload: cameraTarget
	}
}

export const defaultCameraTarget: Vector3 = new Vector3(177, 0, 299)
