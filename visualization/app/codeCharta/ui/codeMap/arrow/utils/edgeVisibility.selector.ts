import { createSelector } from "@ngrx/store"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { edgePreviewNodesSelector } from "./edgePreviewNodes.selector"
import { edgesSelector } from "../../../../state/store/fileSettings/edges/edges.selector"
import { clone } from "../../../../util/clone"
import { setEdgeVisibility } from "./setEdgeVisibility"

export const edgeVisibilitySelector = createSelector(
	edgePreviewNodesSelector,
	edgesSelector,
	edgeMetricSelector,
	(edgePreviewNodes, edges, edgeMetric) => {
		const edgeVisibility = clone(edges)
		setEdgeVisibility(edgePreviewNodes, edgeVisibility, edgeMetric)
		return edgeVisibility
	}
)
