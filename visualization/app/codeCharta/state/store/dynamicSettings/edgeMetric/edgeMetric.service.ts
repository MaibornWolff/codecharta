import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeMetricActions, setEdgeMetric } from "./edgeMetric.actions"
import { EdgeMetricData } from "../../../../codeCharta.model"
import { isActionOfType } from "../../../../util/reduxHelper"
import { EdgeMetricDataService, EdgeMetricDataSubscriber } from "../../metricData/edgeMetricData/edgeMetricData.service"

export interface EdgeMetricSubscriber {
	onEdgeMetricChanged(edgeMetric: string)
}

export class EdgeMetricService implements StoreSubscriber, EdgeMetricDataSubscriber {
	private static EDGE_METRIC_CHANGED_EVENT = "edge-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		EdgeMetricDataService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, EdgeMetricActions)) {
			this.notify(this.select())
		}
	}

	public onEdgeMetricDataChanged(edgeMetrics: EdgeMetricData[]) {
		if (!edgeMetrics.map(x => x.name).includes(this.storeService.getState().dynamicSettings.edgeMetric)) {
			this.reset()
		}
	}

	public reset() {
		this.storeService.dispatch(setEdgeMetric("None"))
	}

	private select() {
		return this.storeService.getState().dynamicSettings.edgeMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(EdgeMetricService.EDGE_METRIC_CHANGED_EVENT, { edgeMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricSubscriber) {
		$rootScope.$on(EdgeMetricService.EDGE_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgeMetricChanged(data.edgeMetric)
		})
	}
}
