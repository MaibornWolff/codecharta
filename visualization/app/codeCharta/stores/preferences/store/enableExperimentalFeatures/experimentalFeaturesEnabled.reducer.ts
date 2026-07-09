import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"

export const defaultExperimentalFeaturesEnabled = false
export const experimentalFeaturesEnabled = createReducer(
    defaultExperimentalFeaturesEnabled,
    on(setExperimentalFeaturesEnabled, setState(defaultExperimentalFeaturesEnabled))
)
