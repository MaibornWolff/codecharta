import { EdgeVisibility } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

export class CodeMapActionsService {
	constructor(private edgeMetricDataService: EdgeMetricDataService, private storeService: StoreService) {
		"ngInject"
	}

	updateEdgePreviews() {
		const state = this.storeService.getState()
		const { edges } = state.fileSettings
		const { edgeMetric } = state.dynamicSettings
		const numberOfEdgesToDisplay = state.appSettings.amountOfEdgePreviews
		const edgePreviewNodes = new Set(this.edgeMetricDataService.getNodesWithHighestValue(edgeMetric, numberOfEdgesToDisplay))

		for (const edge of edges) {
			edge.visible = EdgeVisibility.none

			if (edge.attributes[edgeMetric] !== undefined) {
				const hasFromNodeEdgePreview = edgePreviewNodes.has(edge.fromNodeName)
				const hasToNodeEdgePreview = edgePreviewNodes.has(edge.toNodeName)

				if (hasFromNodeEdgePreview === hasToNodeEdgePreview) {
					if (hasFromNodeEdgePreview) {
						edge.visible = EdgeVisibility.both
					}
				} else if (hasFromNodeEdgePreview) {
					edge.visible = EdgeVisibility.from
				} else {
					edge.visible = EdgeVisibility.to
				}
			}
		}

		this.storeService.dispatch(setEdges(edges))
	}
}
