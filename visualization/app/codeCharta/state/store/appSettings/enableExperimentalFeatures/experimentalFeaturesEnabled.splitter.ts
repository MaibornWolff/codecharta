import {setExperimentalFeaturesEnabled} from "./experimentalFeaturesEnabled.actions"

export function splitExperimentalFeaturesEnabledAction(payload: boolean) {
	return setExperimentalFeaturesEnabled(payload)
}
