import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { AreaMetricActions, setAreaMetric } from "./areaMetric.actions"
import { NodeMetricData } from "../../../../codeCharta.model"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../metricData/nodeMetricData/nodeMetricData.service"

export interface AreaMetricSubscriber {
	onAreaMetricChanged(areaMetric: string)
}

export class AreaMetricService implements StoreSubscriber, NodeMetricDataSubscriber {
	private static AREA_METRIC_CHANGED_EVENT = "area-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, AreaMetricActions)) {
			this.notify(this.select())
		}
	}

	public onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		if (isAnyMetricAvailable(nodeMetricData)) {
			this.reset(nodeMetricData)
		}
	}

	public reset(nodeMetricData: NodeMetricData[]) {
		const areaMetric = this.storeService.getState().dynamicSettings.areaMetric

		if (isMetricUnavailable(nodeMetricData, areaMetric)) {
			const newAreaMetric = getMetricNameFromIndexOrLast(nodeMetricData, 0)
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
