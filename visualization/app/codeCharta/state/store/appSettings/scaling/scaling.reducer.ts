import { defaultScaling, Scaling, ScalingAction, ScalingActions } from "./scaling.actions"

export function scaling(state: Scaling = defaultScaling, action: ScalingAction): Scaling {
	switch (action.type) {
		case ScalingActions.SET_SCALING: {
			return { ...state, ...action.payload }
		}
		default:
			return state
	}
}
