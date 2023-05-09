import { Edge, EdgeVisibility } from "../../../../codeCharta.model"

export const setEdgeVisibility = (edgePreviewNodes: Set<string>, edges: Edge[], edgeMetric: string) => {
	for (const edge of edges) {
		edge.visible = EdgeVisibility.none

		if (edge.attributes[edgeMetric] !== undefined) {
			const hasFromNodeEdgePreview = edgePreviewNodes.has(edge.fromNodeName)
			const hasToNodeEdgePreview = edgePreviewNodes.has(edge.toNodeName)

			if (hasFromNodeEdgePreview && hasToNodeEdgePreview) {
				edge.visible = EdgeVisibility.both
			} else if (hasFromNodeEdgePreview) {
				edge.visible = EdgeVisibility.from
			} else if (hasToNodeEdgePreview) {
				edge.visible = EdgeVisibility.to
			}
		}
	}
}
