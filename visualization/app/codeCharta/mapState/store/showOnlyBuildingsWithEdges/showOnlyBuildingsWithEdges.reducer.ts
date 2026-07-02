import { createReducer, on } from "@ngrx/store"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultShowOnlyBuildingsWithEdges = false
export const showOnlyBuildingsWithEdges = createReducer(
    defaultShowOnlyBuildingsWithEdges,
    on(setShowOnlyBuildingsWithEdges, setState(defaultShowOnlyBuildingsWithEdges))
)
