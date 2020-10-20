import { CCAction } from "../../../../codeCharta.model"

export enum ExperimentalFeaturesEnabledActions {
	SET_EXPERIMENTAL_FEATURES_ENABLED = "SET_EXPERIMENTAL_FEATURES_ENABLED"
}

export interface SetExperimentalFeaturesEnabledAction extends CCAction {
	type: ExperimentalFeaturesEnabledActions.SET_EXPERIMENTAL_FEATURES_ENABLED
	payload: boolean
}

export type ExperimentalFeaturesEnabledAction = SetExperimentalFeaturesEnabledAction

export function setExperimentalFeaturesEnabled(experimentalFeaturesEnabled: boolean = defaultExperimentalFeaturesEnabled): SetExperimentalFeaturesEnabledAction {
	return {
		type: ExperimentalFeaturesEnabledActions.SET_EXPERIMENTAL_FEATURES_ENABLED,
		payload: experimentalFeaturesEnabled
	}
}

export const defaultExperimentalFeaturesEnabled = false
