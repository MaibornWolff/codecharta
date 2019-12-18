import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { DistributionMetricActions } from "./distributionMetric.actions"
import _ from "lodash"

export interface DistributionMetricSubscriber {
	onDistributionMetricChanged(distributionMetric: string)
}

export class DistributionMetricService implements StoreSubscriber {
	private static DISTRIBUTION_METRIC_CHANGED_EVENT = "distribution-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(DistributionMetricActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.distributionMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(DistributionMetricService.DISTRIBUTION_METRIC_CHANGED_EVENT, { distributionMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: DistributionMetricSubscriber) {
		$rootScope.$on(DistributionMetricService.DISTRIBUTION_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onDistributionMetricChanged(data.distributionMetric)
		})
	}
}
