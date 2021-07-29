import { SecondaryMetricsAction, SecondaryMetricsActions, setSecondaryMetrics } from "./secondaryMetrics.actions"

export function secondaryMetrics(state = setSecondaryMetrics().payload, action: SecondaryMetricsAction) {
	switch (action.type) {
		case SecondaryMetricsActions.SET_SECONDARY_METRICS:
			return action.payload
		default:
			return state
	}
}
