import { ScalingAction, ScalingActions } from "./scaling.actions"
import { Vector3 } from "three"

export function scaling(state: Vector3 = new Vector3(1, 1, 1), action: ScalingAction): Vector3 {
	switch (action.type) {
		case ScalingActions.SET_SCALING:
			return action.payload.clone()
		default:
			return state
	}
}
