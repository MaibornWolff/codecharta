import { createReducer, on } from "@ngrx/store"
import { DEPENDENCY_EDGE_TYPES, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { mergeState } from "../../../../util/setState.reducer.factory"
import { setDependencyGraphSettings } from "./dependencyGraph.actions"

export const defaultDependencyGraphSettings: DependencyGraphSettings = {
    shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES],
    edgeStyle: "curved",
    isAnchoredAtSideMiddle: false,
    edgeWidth: { thickness: "byCount", factor: 1 },
    levelLabel: "number"
}

export const dependencyGraph = createReducer(
    defaultDependencyGraphSettings,
    on(setDependencyGraphSettings, mergeState(defaultDependencyGraphSettings))
)
