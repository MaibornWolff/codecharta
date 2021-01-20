import { TrackingDataEnabledAction, TrackingDataEnabledActions, setTrackingDataEnabled } from "./trackingDataEnabled.actions"

export function trackingDataEnabled(state = setTrackingDataEnabled().payload, action: TrackingDataEnabledAction) {
	switch (action.type) {
		case TrackingDataEnabledActions.SET_TRACKING_DATA_ENABLED:
			return action.payload
		default:
			return state
	}
}
