import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { HeightMetricActions, setHeightMetric } from "./heightMetric.actions"
import _ from "lodash"
import { MetricData } from "../../../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../../metric.service"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"

export interface HeightMetricSubscriber {
	onHeightMetricChanged(heightMetric: string)
}

export class HeightMetricService implements StoreSubscriber, MetricServiceSubscriber {
	private static HEIGHT_METRIC_CHANGED_EVENT = "height-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(HeightMetricActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		if (isAnyMetricAvailable(metricData)) {
			this.reset(metricData)
		}
	}

	public onMetricDataRemoved() {}

	public reset(metricData: MetricData[]) {
		const heightMetric = this.storeService.getState().dynamicSettings.heightMetric

		if (isMetricUnavailable(metricData, heightMetric)) {
			const newHeightMetric = getMetricNameFromIndexOrLast(metricData, 1)
			this.storeService.dispatch(setHeightMetric(newHeightMetric))
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
