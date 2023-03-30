import { createReducer, on } from "@ngrx/store"
import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"

export const experimentalFeaturesEnabled = createReducer(
	false,
	on(setExperimentalFeaturesEnabled, (_state, payload) => payload.value)
)
