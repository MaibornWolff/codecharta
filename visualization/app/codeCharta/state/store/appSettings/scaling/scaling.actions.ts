import { Action } from "redux"
import { Vector3 } from "three"

export enum ScalingActions {
	SET_SCALING = "SET_SCALING"
}

export interface SetScalingAction extends Action {
	type: ScalingActions.SET_SCALING
	payload: Vector3
}

export type ScalingAction = SetScalingAction

export function setScaling(scaling: Vector3): ScalingAction {
	return {
		type: ScalingActions.SET_SCALING,
		payload: scaling
	}
}
