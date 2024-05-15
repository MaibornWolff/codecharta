import { createReducer, on } from "@ngrx/store"
import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultExperimentalFeaturesEnabled = false
export const experimentalFeaturesEnabled = createReducer(
    defaultExperimentalFeaturesEnabled,
    on(setExperimentalFeaturesEnabled, setState(defaultExperimentalFeaturesEnabled))
)
