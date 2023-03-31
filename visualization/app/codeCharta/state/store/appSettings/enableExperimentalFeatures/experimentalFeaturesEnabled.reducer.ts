import { createReducer, on } from "@ngrx/store"
import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"

export const defaultExperimentalFeaturesEnabled = false
export const experimentalFeaturesEnabled = createReducer(
	defaultExperimentalFeaturesEnabled,
	on(setExperimentalFeaturesEnabled, (_state, payload) => payload.value)
)
