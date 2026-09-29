import { createAction, props } from "@ngrx/store"
import { DependencyGraphSettings } from "../../../../model/dependencyGraph.model"

export const setDependencyGraphSettings = createAction(
    "SET_DEPENDENCY_GRAPH_SETTINGS",
    props<{ value: Partial<DependencyGraphSettings> }>()
)
