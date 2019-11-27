import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ColorMetricActions } from "./colorMetric.actions"
import _ from "lodash"

export interface ColorMetricSubscriber {
	onColorMetricChanged(colorMetric: string)
}

export class ColorMetricService implements StoreSubscriber {
	private static COLOR_METRIC_CHANGED_EVENT = "color-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(ColorMetricActions).includes(actionType)) {
			this.notify(this.select())
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
