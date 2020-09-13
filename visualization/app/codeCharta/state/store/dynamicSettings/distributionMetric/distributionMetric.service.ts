import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { DistributionMetricActions, setDistributionMetric } from "./distributionMetric.actions"
import { NodeMetricData } from "../../../../codeCharta.model"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../metricData/nodeMetricData/nodeMetricData.service"

export interface DistributionMetricSubscriber {
	onDistributionMetricChanged(distributionMetric: string)
}

export class DistributionMetricService implements StoreSubscriber, NodeMetricDataSubscriber {
	private static DISTRIBUTION_METRIC_CHANGED_EVENT = "distribution-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, DistributionMetricActions)) {
			this.notify(this.select())
		}
	}

	public onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		if (isAnyMetricAvailable(nodeMetricData)) {
			this.reset(nodeMetricData)
		}
	}

	public reset(metricData: NodeMetricData[]) {
		const { distributionMetric } = this.storeService.getState().dynamicSettings

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
		$rootScope.$on(DistributionMetricService.DISTRIBUTION_METRIC_CHANGED_EVENT, (_event_, data) => {
			subscriber.onDistributionMetricChanged(data.distributionMetric)
		})
	}
}
