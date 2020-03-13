import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorMetricActions, setColorMetric } from "./colorMetric.actions"
import { MetricData } from "../../../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../../metric.service"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"

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
		if (isActionOfType(actionType, ColorMetricActions)) {
			this.notify(this.select())
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		if (isAnyMetricAvailable(metricData)) {
			this.reset(metricData)
		}
	}

	public reset(metricData: MetricData[]) {
		const colorMetric = this.storeService.getState().dynamicSettings.colorMetric

		if (isMetricUnavailable(metricData, colorMetric)) {
			const newColorMetric = getMetricNameFromIndexOrLast(metricData, 2)
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
