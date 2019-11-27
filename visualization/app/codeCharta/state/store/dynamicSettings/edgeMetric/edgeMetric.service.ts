import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeMetricActions } from "./edgeMetric.actions"
import _ from "lodash"

export interface EdgeMetricSubscriber {
	onEdgeMetricChanged(edgeMetric: string)
}

export class EdgeMetricService implements StoreSubscriber {
	private static EDGE_METRIC_CHANGED_EVENT = "edge-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(EdgeMetricActions).includes(actionType)) {
			this.notify(this.select())
		}
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
