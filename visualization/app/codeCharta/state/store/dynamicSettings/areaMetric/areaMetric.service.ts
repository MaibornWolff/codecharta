import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AreaMetricActions } from "./areaMetric.actions"
import _ from "lodash"

export interface AreaMetricSubscriber {
	onAreaMetricChanged(areaMetric: string)
}

export class AreaMetricService implements StoreSubscriber {
	private static AREA_METRIC_CHANGED_EVENT = "area-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(AreaMetricActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.areaMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(AreaMetricService.AREA_METRIC_CHANGED_EVENT, { areaMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: AreaMetricSubscriber) {
		$rootScope.$on(AreaMetricService.AREA_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onAreaMetricChanged(data.areaMetric)
		})
	}
}
