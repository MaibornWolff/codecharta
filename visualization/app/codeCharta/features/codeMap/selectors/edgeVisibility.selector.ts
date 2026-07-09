import { createSelector } from "@ngrx/store"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { edgeMetricSelector, showIncomingEdgesSelector, showOutgoingEdgesSelector } from "../../../stores/mapState/mapState.read.facade"
import { clone } from "../../../util/clone"
import { edgePreviewNodesSelector } from "./edgePreviewNodes.selector"
import { setEdgeVisibility } from "./setEdgeVisibility"

export const edgeVisibilitySelector = createSelector(
    edgePreviewNodesSelector,
    edgesSelector,
    edgeMetricSelector,
    showIncomingEdgesSelector,
    showOutgoingEdgesSelector,
    (edgePreviewNodes, edges, edgeMetric, showIncomingEdges, showOutgoingEdges) => {
        const edgeVisibility = clone(edges)
        setEdgeVisibility(edgePreviewNodes, edgeVisibility, edgeMetric, showIncomingEdges, showOutgoingEdges)
        return edgeVisibility
    }
)
