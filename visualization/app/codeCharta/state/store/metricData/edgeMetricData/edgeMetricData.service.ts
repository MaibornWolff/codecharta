import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeMetricData } from "../../../../codeCharta.model"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { edgeMetricDataSelector, nodeEdgeMetricsMap } from "../../../selectors/accumulatedData/metricData/edgeMetricData.selector"

export interface EdgeMetricDataSubscriber {
	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[])
}

export class EdgeMetricDataService implements BlacklistSubscriber, FilesSelectionSubscriber, AttributeTypesSubscriber {
	private static EDGE_METRIC_DATA_CHANGED_EVENT = "edge-metric-data-changed"
	static NONE_METRIC = "None"

	private edgeMetricData: EdgeMetricData[]

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		BlacklistService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged() {
		this.updateEdgeMetricData()
	}

	onFilesSelectionChanged() {
		this.updateEdgeMetricData()
	}

	// This shouldn't be needed, as edgeMetricData is not dependent on AttributeTypesChanged, but switching to median in attribute side bar breaks without it
	onAttributeTypesChanged() {
		this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, { edgeMetricData: this.edgeMetricData })
	}

	getAmountOfAffectedBuildings(metricName: string) {
		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)
		return nodeEdgeMetrics === undefined ? 0 : nodeEdgeMetrics.size
	}

	getNodesWithHighestValue(metricName: string, amountOfEdgePreviews: number) {
		const keys: string[] = []

		if (amountOfEdgePreviews === 0) {
			return keys
		}

		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)

		if (nodeEdgeMetrics === undefined) {
			return keys
		}

		for (const key of nodeEdgeMetrics.keys()) {
			keys.push(key)
			if (keys.length === amountOfEdgePreviews) {
				break
			}
		}
		return keys
	}

	getAttributeTypeByMetric(metricName: string) {
		return this.storeService.getState().fileSettings.attributeTypes.edges[metricName]
	}

	private updateEdgeMetricData() {
		const edgeMetricData = edgeMetricDataSelector(this.storeService.getState())
		if (edgeMetricData !== this.edgeMetricData) {
			this.edgeMetricData = edgeMetricData
			this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, { edgeMetricData })
		}
	}

	static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricDataSubscriber) {
		$rootScope.$on(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onEdgeMetricDataChanged(data.edgeMetricData)
		})
	}
}
