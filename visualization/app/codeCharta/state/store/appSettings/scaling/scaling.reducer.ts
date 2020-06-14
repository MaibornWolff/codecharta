import { ScalingAction, ScalingActions, setScaling } from "./scaling.actions"
import { Vector3 } from "three"

export function scaling(state: Vector3 = setScaling().payload, action: ScalingAction): Vector3 {
	switch (action.type) {
		case ScalingActions.SET_SCALING:
			return new Vector3(action.payload.x, action.payload.y, action.payload.z)
		default:
			return state
	}
}
