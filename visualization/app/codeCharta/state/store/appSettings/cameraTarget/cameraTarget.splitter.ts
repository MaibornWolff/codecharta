import { Vector3 } from "three"
import { setCameraTarget } from "./cameraTarget.actions"

export function splitCameraTargetAction(payload: Vector3) {
	return setCameraTarget(payload)
}
