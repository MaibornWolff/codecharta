import { Action } from "redux"

export enum IsHeightAndColorMetricCoupledActions {
	TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_COUPLED = "TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_COUPLED"
}

export interface ToggleHeightAndColorMetricCoupledAction extends Action {
	type: IsHeightAndColorMetricCoupledActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_COUPLED
}

export type IsHeightAndColorMetricCoupledAction = ToggleHeightAndColorMetricCoupledAction

export function toggleHeightAndColorMetricCoupling(): ToggleHeightAndColorMetricCoupledAction {
	return {
		type: IsHeightAndColorMetricCoupledActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_COUPLED
	}
}

export const defaultIsHeightAndColorMetricCoupled = false
