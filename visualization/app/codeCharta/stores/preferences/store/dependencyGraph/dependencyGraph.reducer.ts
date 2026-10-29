import { createReducer, on } from "@ngrx/store"
import { DEPENDENCY_BOX_BADGES, DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { mergeState } from "../../../../util/setState.reducer.factory"
import { setDependencyGraphSettings } from "./dependencyGraph.actions"

export const defaultDependencyGraphSettings: DependencyGraphSettings = {
    shownEdgeTypes: ["cyclic", "feedbackContainerLevel", "feedbackLeafLevel"],
    isHoverLimitedToShownEdgeTypes: false,
    isHoverHighlighted: true,
    edgeColors: { regular: "#8c96a3", cyclic: "#2563eb", feedbackContainerLevel: "#dc2626", feedbackLeafLevel: "#7f1d1d" },
    lineStyleShows: "edgeType",
    edgeStyle: "combined",
    edgeShape: "curved",
    isAnchoredAtSideMiddle: false,
    edgeWidth: { thickness: "byCount", factor: 1 },
    hierarchy: "folders",
    shownBoxBadges: [...DEPENDENCY_BOX_BADGES]
}

export const dependencyGraph = createReducer(
    defaultDependencyGraphSettings,
    on(setDependencyGraphSettings, mergeState(defaultDependencyGraphSettings))
)
