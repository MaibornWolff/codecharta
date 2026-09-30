import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDependencyViewEnabled } from "./dependencyViewEnabled.actions"

export const defaultDependencyViewEnabled = false
export const dependencyViewEnabled = createReducer(
    defaultDependencyViewEnabled,
    on(setDependencyViewEnabled, setState(defaultDependencyViewEnabled))
)
