import { Vector3 } from "three"
import { CameraTargetAction, CameraTargetActions, setCameraTarget } from "./cameraTarget.actions"

export function cameraTarget(state: Vector3 = setCameraTarget().payload, action: CameraTargetAction): Vector3 {
	switch (action.type) {
		case CameraTargetActions.SET_CAMERA_TARGET:
			return new Vector3(action.payload.x, action.payload.y, action.payload.z)
		default:
			return state
	}
}
