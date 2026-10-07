import { createReducer, on } from "@ngrx/store"
import { DEPENDENCY_EDGE_TYPES, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { mergeState } from "../../../../util/setState.reducer.factory"
import { setDependencyGraphSettings } from "./dependencyGraph.actions"

export const defaultDependencyGraphSettings: DependencyGraphSettings = {
    shownEdgeTypes: [...DEPENDENCY_EDGE_TYPES],
    edgeColors: { regular: "#8c96a3", cyclic: "#2563eb", feedbackContainerLevel: "#dc2626", feedbackLeafLevel: "#7f1d1d" },
    lineStyleShows: "edgeType",
    edgeStyle: "curved",
    isAnchoredAtSideMiddle: false,
    edgeWidth: { thickness: "byCount", factor: 1 },
    levelLabel: "number",
    hierarchy: "folders",
    showsCycleBadges: true
}

export const dependencyGraph = createReducer(
    defaultDependencyGraphSettings,
    on(setDependencyGraphSettings, mergeState(defaultDependencyGraphSettings))
)
