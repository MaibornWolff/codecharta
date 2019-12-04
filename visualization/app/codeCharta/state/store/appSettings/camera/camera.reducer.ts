import { CameraAction, CameraActions } from "./camera.actions"
import { Vector3 } from "three"

const defaultCamera: Vector3 = new Vector3(0, 300, 1000)

export function camera(state: Vector3 = defaultCamera.clone(), action: CameraAction): Vector3 {
	switch (action.type) {
		case CameraActions.SET_DEFAULT:
			return defaultCamera.clone()
		case CameraActions.SET_CAMERA:
			return action.payload.clone()
		default:
			return state
	}
}
