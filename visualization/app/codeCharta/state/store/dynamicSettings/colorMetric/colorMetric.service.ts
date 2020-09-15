import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorMetricActions, setColorMetric } from "./colorMetric.actions"
import { NodeMetricData } from "../../../../codeCharta.model"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../metricData/nodeMetricData/nodeMetricData.service"

export interface ColorMetricSubscriber {
	onColorMetricChanged(colorMetric: string)
}

export class ColorMetricService implements StoreSubscriber, NodeMetricDataSubscriber {
	private static COLOR_METRIC_CHANGED_EVENT = "color-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ColorMetricActions)) {
			this.notify(this.select())
		}
	}

	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		if (isAnyMetricAvailable(nodeMetricData)) {
			this.reset(nodeMetricData)
		}
	}

	reset(nodeMetricData: NodeMetricData[]) {
		const { colorMetric } = this.storeService.getState().dynamicSettings

		if (isMetricUnavailable(nodeMetricData, colorMetric)) {
			const newColorMetric = getMetricNameFromIndexOrLast(nodeMetricData, 2)
			this.storeService.dispatch(setColorMetric(newColorMetric))
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.colorMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(ColorMetricService.COLOR_METRIC_CHANGED_EVENT, { colorMetric: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ColorMetricSubscriber) {
		$rootScope.$on(ColorMetricService.COLOR_METRIC_CHANGED_EVENT, (_event_, data) => {
			subscriber.onColorMetricChanged(data.colorMetric)
		})
	}
}
