import { Edge, EdgeVisibility } from "../../../../codeCharta.model"

export const setEdgeVisibility = (
    edgePreviewNodes: Set<string>,
    edges: Edge[],
    edgeMetric: string,
    showIncomingEdges: boolean,
    showOutgoingEdges: boolean
) => {
    for (const edge of edges) {
        edge.visible = EdgeVisibility.none

        if (edge.attributes[edgeMetric] !== undefined) {
            const hasFromNodeEdgePreview = edgePreviewNodes.has(edge.fromNodeName)
            const hasToNodeEdgePreview = edgePreviewNodes.has(edge.toNodeName)

            if (showIncomingEdges && showOutgoingEdges && hasFromNodeEdgePreview && hasToNodeEdgePreview) {
                edge.visible = EdgeVisibility.both
            } else if (showOutgoingEdges && hasFromNodeEdgePreview) {
                edge.visible = EdgeVisibility.from
            } else if (showIncomingEdges && hasToNodeEdgePreview) {
                edge.visible = EdgeVisibility.to
            }
        }
    }
}
