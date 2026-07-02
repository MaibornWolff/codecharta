import { createAction, props } from "@ngrx/store"

export const setShowOnlyBuildingsWithEdges = createAction("SET_SHOW_ONLY_BUILDINGS_WITH_EDGES", props<{ value: boolean }>())
