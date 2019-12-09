import { CameraAction, setCamera } from "./camera.actions"
import { Vector3 } from "three"

export function splitCameraAction(payload: Vector3): CameraAction {
	return setCamera(payload)
}
