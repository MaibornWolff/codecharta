import { Vector3 } from "three"
import { CCAction } from "../../../../codeCharta.model"

export enum ScalingActions {
	SET_SCALING = "SET_SCALING"
}

export interface SetScalingAction extends CCAction {
	type: ScalingActions.SET_SCALING
	payload: Vector3
}

export type ScalingAction = SetScalingAction

export function setScaling(scaling: Vector3 = defaultScaling): SetScalingAction {
	return {
		type: ScalingActions.SET_SCALING,
		payload: scaling
	}
}

export const defaultScaling = new Vector3(1, 1, 1)
