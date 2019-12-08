import { CameraAction, setCamera } from "./camera.actions"
import { Vector3 } from "three"

export function splitCameraAction(payload: { x: number; y: number; z: number }): CameraAction {
	const payloadAsVector3 = new Vector3(payload.x, payload.y, payload.z)
	return setCamera(payloadAsVector3)
}
