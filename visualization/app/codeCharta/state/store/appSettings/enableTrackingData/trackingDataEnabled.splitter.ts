import { setTrackingDataEnabled } from "./trackingDataEnabled.actions"

export function splitTrackingDataEnabledAction(payload: boolean) {
	return setTrackingDataEnabled(payload)
}
