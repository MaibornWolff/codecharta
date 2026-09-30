import { createAction, props } from "@ngrx/store"

export const setDependencyViewEnabled = createAction("SET_DEPENDENCY_VIEW_ENABLED", props<{ value: boolean }>())
