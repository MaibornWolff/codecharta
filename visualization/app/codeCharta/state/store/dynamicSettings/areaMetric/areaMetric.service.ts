import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AreaMetricActions, setAreaMetric } from "./areaMetric.actions"
import _ from "lodash"
import { MetricData } from "../../../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../../metric.service"
import { getResetMetricName, isAnyMetricAvailable } from "../../../../util/metricHelper"

export interface AreaMetricSubscriber {
	onAreaMetricChanged(areaMetric: string)
}

export class AreaMetricService implements StoreSubscriber, MetricServiceSubscriber {
	private static AREA_METRIC_CHANGED_EVENT = "area-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(AreaMetricActions).includes(actionType)) {
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
		const areaMetric = this.storeService.getState().dynamicSettings.areaMetric

		const newAreaMetric = getResetMetricName(metricData, areaMetric, 0)

		if (newAreaMetric) {
			this.storeService.dispatch(setAreaMetric(newAreaMetric))
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
