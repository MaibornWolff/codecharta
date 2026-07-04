import { createSelector } from "@ngrx/store"
import { edgePreviewNodesSelector } from "./edgePreviewNodes.selector"
import { edgesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { clone } from "../../../util/clone"
import { setEdgeVisibility } from "./setEdgeVisibility"
import { showIncomingEdgesSelector, showOutgoingEdgesSelector, edgeMetricSelector } from "../../../mapState/mapState.read.facade"

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
