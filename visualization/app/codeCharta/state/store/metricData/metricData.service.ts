import { IRootScopeService } from "angular"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "./nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "./edgeMetricData/edgeMetricData.service"
import { StoreService } from "../../store.service"
import { nodeMetricDataSelector } from "../../selectors/accumulatedData/metricData/nodeMetricData.selector"
import { edgeMetricDataSelector } from "../../selectors/accumulatedData/metricData/edgeMetricData.selector"

export interface MetricDataSubscriber {
	onMetricDataChanged()
}

export class MetricDataService implements NodeMetricDataSubscriber, EdgeMetricDataSubscriber {
	private static METRIC_DATA_COMPLETE = "metric-data-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		EdgeMetricDataService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	onEdgeMetricDataChanged() {
		const nodeMetricData = nodeMetricDataSelector(this.storeService.getState())
		if (nodeMetricData.length > 0) {
			this.notify()
		}
	}

	onNodeMetricDataChanged() {
		if (this.edgeMetricsAvailable()) {
			this.notify()
		}
	}

	private notify() {
		this.$rootScope.$broadcast(MetricDataService.METRIC_DATA_COMPLETE)
	}

	private edgeMetricsAvailable() {
		const { edges } = this.storeService.getState().fileSettings
		return edges.length === 0 || (edges.length > 0 && edgeMetricDataSelector(this.storeService.getState()).length > 0)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: MetricDataSubscriber) {
		$rootScope.$on(MetricDataService.METRIC_DATA_COMPLETE, () => {
			subscriber.onMetricDataChanged()
		})
	}
}
