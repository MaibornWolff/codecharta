import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { HeightMetricActions } from "./heightMetric.actions"
import _ from "lodash"

export interface HeightMetricSubscriber {
	onHeightMetricChanged(heightMetric: string)
}

export class HeightMetricService implements StoreSubscriber {
	private static HEIGHT_METRIC_CHANGED_EVENT = "height-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(HeightMetricActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.heightMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(HeightMetricService.HEIGHT_METRIC_CHANGED_EVENT, { heightMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: HeightMetricSubscriber) {
		$rootScope.$on(HeightMetricService.HEIGHT_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onHeightMetricChanged(data.heightMetric)
		})
	}
}
