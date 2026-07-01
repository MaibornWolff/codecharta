import { createSelector } from "@ngrx/store"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { edgePreviewNodesSelector } from "./edgePreviewNodes.selector"
import { edgesSelector } from "../../../state/store/fileSettings/edges/edges.selector"
import { clone } from "../../../util/clone"
import { setEdgeVisibility } from "./setEdgeVisibility"
import { showIncomingEdgesSelector, showOutgoingEdgesSelector } from "../../../appearance/appearance.facade"

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
