import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { DistributionMetricActions, setDistributionMetric } from "./distributionMetric.actions"
import { MetricData } from "../../../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../../metric.service"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface DistributionMetricSubscriber {
	onDistributionMetricChanged(distributionMetric: string)
}

export class DistributionMetricService implements StoreSubscriber, MetricServiceSubscriber {
	private static DISTRIBUTION_METRIC_CHANGED_EVENT = "distribution-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, DistributionMetricActions)) {
			this.notify(this.select())
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		if (isAnyMetricAvailable(metricData)) {
			this.reset(metricData)
		}
	}

	public reset(metricData: MetricData[]) {
		const distributionMetric = this.storeService.getState().dynamicSettings.distributionMetric

		if (isMetricUnavailable(metricData, distributionMetric)) {
			const newDistributionMetric = getMetricNameFromIndexOrLast(metricData, 0)
			this.storeService.dispatch(setDistributionMetric(newDistributionMetric))
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.distributionMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(DistributionMetricService.DISTRIBUTION_METRIC_CHANGED_EVENT, {
			distributionMetric: newState
		})
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: DistributionMetricSubscriber) {
		$rootScope.$on(DistributionMetricService.DISTRIBUTION_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onDistributionMetricChanged(data.distributionMetric)
		})
	}
}
