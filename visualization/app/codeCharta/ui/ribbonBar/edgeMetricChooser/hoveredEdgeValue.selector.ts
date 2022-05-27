import { createSelector } from "../../../state/angular-redux/createSelector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"

export const hoveredEdgeValueSelector = createSelector([hoveredNodeSelector, edgeMetricSelector], (hoveredNode, edgeMetric) => {
	if (!hoveredNode) {
		return null
	}

	const hoveredEdgeValues = hoveredNode.edgeAttributes[edgeMetric]
	if (!hoveredEdgeValues) {
		return null
	}

	return `${_formatValue(hoveredEdgeValues.incoming)} / ${_formatValue(hoveredEdgeValues.outgoing)}`
})

const _formatValue = (x?: number) => (typeof x === "number" ? x.toLocaleString() : "-")
