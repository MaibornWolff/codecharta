import { Vector3 } from "three"
import { CameraTargetAction, setCameraTarget } from "./cameraTarget.actions"

export function splitCameraTargetAction(payload: Vector3): CameraTargetAction {
	return setCameraTarget(payload)
}
