import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorMetricActions, setColorMetric } from "./colorMetric.actions"
import _ from "lodash"
import { MetricData } from "../../../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../../metric.service"
import { getResetMetricName, isAnyMetricAvailable } from "../../../../util/metricHelper"

export interface ColorMetricSubscriber {
	onColorMetricChanged(colorMetric: string)
}

export class ColorMetricService implements StoreSubscriber, MetricServiceSubscriber {
	private static COLOR_METRIC_CHANGED_EVENT = "color-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(ColorMetricActions).includes(actionType)) {
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
		const colorMetric = this.storeService.getState().dynamicSettings.colorMetric

		const newColorMetric = getResetMetricName(metricData, colorMetric, 2)

		if (newColorMetric) {
			this.storeService.dispatch(setColorMetric(newColorMetric))
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(ColorMetricService.COLOR_METRIC_CHANGED_EVENT, { colorMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ColorMetricSubscriber) {
		$rootScope.$on(ColorMetricService.COLOR_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onColorMetricChanged(data.colorMetric)
		})
	}
}
