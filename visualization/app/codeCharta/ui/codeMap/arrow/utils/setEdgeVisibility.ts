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

            const incomingEdgeExistsAndIsShown = showIncomingEdges && hasToNodeEdgePreview
            const outgoingEdgeExistsAndIsShown = showOutgoingEdges && hasFromNodeEdgePreview

            if (outgoingEdgeExistsAndIsShown && incomingEdgeExistsAndIsShown) {
                edge.visible = EdgeVisibility.both
            } else if (outgoingEdgeExistsAndIsShown) {
                edge.visible = EdgeVisibility.from
            } else if (incomingEdgeExistsAndIsShown) {
                edge.visible = EdgeVisibility.to
            }
        }
    }
}
