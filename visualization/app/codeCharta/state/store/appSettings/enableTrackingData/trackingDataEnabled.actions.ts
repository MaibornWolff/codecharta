import { CCAction } from "../../../../codeCharta.model"

export enum TrackingDataEnabledActions {
	SET_TRACKING_DATA_ENABLED = "SET_TRACKING_DATA_ENABLED"
}

export interface SetTrackingDataEnabledAction extends CCAction {
	type: TrackingDataEnabledActions.SET_TRACKING_DATA_ENABLED
	payload: boolean
}

export type TrackingDataEnabledAction = SetTrackingDataEnabledAction

export function setTrackingDataEnabled(trackingDataEnabled: boolean = defaultTrackingDataEnabled): SetTrackingDataEnabledAction {
	return {
		type: TrackingDataEnabledActions.SET_TRACKING_DATA_ENABLED,
		payload: trackingDataEnabled
	}
}

export const defaultTrackingDataEnabled = false
