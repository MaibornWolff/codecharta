import { setCamera } from "./camera.actions"
import { Vector3 } from "three"

export function splitCameraAction(payload: Vector3) {
	return setCamera(payload)
}
