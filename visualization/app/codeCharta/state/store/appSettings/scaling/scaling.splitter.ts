import { ScalingAction, setScaling } from "./scaling.actions"
import { Vector3 } from "three"

export function splitScalingAction(payload: { x: number; y: number; z: number }): ScalingAction {
	const payloadAsVector3 = new Vector3(payload.x, payload.y, payload.z)
	return setScaling(payloadAsVector3)
}
