import { Action } from "redux"

export enum IsHeightAndColorMetricLinkedActions {
	TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED = "TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED"
}

export interface ToggleHeightAndColorMetricLinkedAction extends Action {
	type: IsHeightAndColorMetricLinkedActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED
}

export type IsHeightAndColorMetricLinkedAction = ToggleHeightAndColorMetricLinkedAction

export function toggleHeightAndColorMetricLink(): ToggleHeightAndColorMetricLinkedAction {
	return {
		type: IsHeightAndColorMetricLinkedActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED
	}
}

export const defaultIsHeightAndColorMetricLinked = false
