import { IRootScopeService } from "angular"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "./nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "./edgeMetricData/edgeMetricData.service"
import { EdgeMetricData, NodeMetricData } from "../../../codeCharta.model"
import { StoreService } from "../../store.service"

export interface MetricDataSubscriber {
	onMetricDataChanged()
}

export class MetricDataService implements NodeMetricDataSubscriber, EdgeMetricDataSubscriber {
	private static METRIC_DATA_COMPLETE = "metric-data-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		EdgeMetricDataService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	public onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[]) {
		if (this.storeService.getState().metricData.nodeMetricData.length > 0) {
			this.notify()
		}
	}

	public onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		if (this.edgeMetricsAvailable()) {
			this.notify()
		}
	}

	private notify() {
		this.$rootScope.$broadcast(MetricDataService.METRIC_DATA_COMPLETE)
	}

	private edgeMetricsAvailable(): boolean {
		const edges = this.storeService.getState().fileSettings.edges
		return edges.length === 0 || (edges.length > 0 && this.storeService.getState().metricData.edgeMetricData.length > 0)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricDataSubscriber) {
		$rootScope.$on(MetricDataService.METRIC_DATA_COMPLETE, () => {
			subscriber.onMetricDataChanged()
		})
	}
}
