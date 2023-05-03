import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../codeCharta.model"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"

const _formatValue = (x?: number) => (typeof x === "number" ? x.toLocaleString() : "-")

export const _formatHoveredEdgeValue = (edgeMetric: string, hoveredNode?: Pick<CodeMapNode, "edgeAttributes">) => {
	if (!hoveredNode) {
		return null
	}

	const hoveredEdgeValues = hoveredNode.edgeAttributes[edgeMetric]
	if (!hoveredEdgeValues) {
		return null
	}

	return `${_formatValue(hoveredEdgeValues.incoming)} / ${_formatValue(hoveredEdgeValues.outgoing)}`
}

export const hoveredEdgeValueSelector = createSelector(edgeMetricSelector, hoveredNodeSelector, _formatHoveredEdgeValue)
