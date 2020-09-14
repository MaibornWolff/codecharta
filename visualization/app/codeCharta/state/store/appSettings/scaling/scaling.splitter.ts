import { setScaling } from "./scaling.actions"
import { Vector3 } from "three"

export function splitScalingAction(payload: Vector3) {
	return setScaling(payload)
}
