import { IRootScopeService } from "angular"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "./nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "./edgeMetricData/edgeMetricData.service"
import { EdgeMetricData, NodeMetricData } from "../../../codeCharta.model"
import { StoreService } from "../../store.service"

export interface MetricDataSubscriber {
	onMetricDataComplete()
}

export class MetricDataService implements NodeMetricDataSubscriber, EdgeMetricDataSubscriber {
	public static UNARY_METRIC = "unary"
	private static METRIC_DATA_COMPLETE = "metric-data-complete"

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
		if (this.storeService.getState().metricData.edgeMetricData.length > 0) {
			this.notify()
		}
	}

	private notify() {
		this.$rootScope.$broadcast(MetricDataService.METRIC_DATA_COMPLETE)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricDataSubscriber) {
		$rootScope.$on(MetricDataService.METRIC_DATA_COMPLETE, () => {
			subscriber.onMetricDataComplete()
		})
	}
}
