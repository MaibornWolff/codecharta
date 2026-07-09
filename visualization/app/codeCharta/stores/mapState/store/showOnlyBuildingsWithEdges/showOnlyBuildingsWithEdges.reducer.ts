import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

export const defaultShowOnlyBuildingsWithEdges = false
export const showOnlyBuildingsWithEdges = createReducer(
    defaultShowOnlyBuildingsWithEdges,
    on(setShowOnlyBuildingsWithEdges, setState(defaultShowOnlyBuildingsWithEdges))
)
