import {
	ExperimentalFeaturesEnabledAction,
	ExperimentalFeaturesEnabledActions,
	setExperimentalFeaturesEnabled
} from "./experimentalFeaturesEnabled.actions"

export function experimentalFeaturesEnabled(state = setExperimentalFeaturesEnabled().payload, action: ExperimentalFeaturesEnabledAction) {
	switch (action.type) {
		case ExperimentalFeaturesEnabledActions.SET_EXPERIMENTAL_FEATURES_ENABLED:
			return action.payload
		default:
			return state
	}
}
