import { CameraAction, CameraActions, setCamera } from "./camera.actions"
import { Vector3 } from "three"

export function camera(state: Vector3 = setCamera().payload, action: CameraAction): Vector3 {
	switch (action.type) {
		case CameraActions.SET_CAMERA:
			return new Vector3(action.payload.x, action.payload.y, action.payload.z)
		default:
			return state
	}
}
