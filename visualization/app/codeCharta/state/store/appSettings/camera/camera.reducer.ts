import { CameraAction, CameraActions } from "./camera.actions"
import { Vector3 } from "three"

export function camera(state: Vector3 = new Vector3(0, 300, 1000), action: CameraAction): Vector3 {
	switch (action.type) {
		case CameraActions.SET_CAMERA:
			return action.payload.clone()
		default:
			return state
	}
}
