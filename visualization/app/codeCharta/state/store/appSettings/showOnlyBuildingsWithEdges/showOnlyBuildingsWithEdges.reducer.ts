import { createReducer, on } from "@ngrx/store"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultShowOnlyBuildingsWithEdges = false
export const showOnlyBuildingsWithEdges = createReducer(
    defaultShowOnlyBuildingsWithEdges,
    on(setShowOnlyBuildingsWithEdges, setState(defaultShowOnlyBuildingsWithEdges))
)
