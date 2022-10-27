import { Vector3 } from "three"
import { CCAction } from "../../../../codeCharta.model"

export type Scaling = {
	x: number
	y: number
	z: number
}

export enum ScalingActions {
	SET_SCALING = "SET_SCALING"
}

export interface SetScalingAction extends CCAction {
	type: ScalingActions.SET_SCALING
	payload: Partial<Vector3>
}

export type ScalingAction = SetScalingAction

export function setScaling(scaling: Partial<Scaling> = defaultScaling): SetScalingAction {
	return {
		type: ScalingActions.SET_SCALING,
		payload: scaling
	}
}

export const defaultScaling = { x: 1, y: 1, z: 1 }
