import { createAction, props } from "@ngrx/store"

export const setExperimentalFeaturesEnabled = createAction("SET_EXPERIMENTAL_FEATURES_ENABLED", props<{ value: boolean }>())
