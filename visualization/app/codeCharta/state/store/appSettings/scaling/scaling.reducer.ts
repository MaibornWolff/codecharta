import { defaultScaling, ScalingAction, ScalingActions } from "./scaling.actions"
import { Vector3 } from "three"

export function scaling(state: Vector3 = defaultScaling, action: ScalingAction): Vector3 {
	switch (action.type) {
		case ScalingActions.SET_SCALING: {
			const newVector = { ...state, ...action.payload }
			return new Vector3(newVector.x, newVector.y, newVector.z)
		}
		default:
			return state
	}
}
