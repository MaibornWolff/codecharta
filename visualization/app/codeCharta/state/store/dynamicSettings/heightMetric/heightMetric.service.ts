import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { HeightMetricActions, setHeightMetric } from "./heightMetric.actions"
import { NodeMetricData } from "../../../../codeCharta.model"
import { getMetricNameFromIndexOrLast, isAnyMetricAvailable, isMetricUnavailable } from "../../../../util/metricHelper"
import { isActionOfType } from "../../../../util/reduxHelper"
import { NodeMetricDataService, NodeMetricDataSubscriber } from "../../metricData/nodeMetricData/nodeMetricData.service"

export interface HeightMetricSubscriber {
	onHeightMetricChanged(heightMetric: string)
}

export class HeightMetricService implements StoreSubscriber, NodeMetricDataSubscriber {
	private static HEIGHT_METRIC_CHANGED_EVENT = "height-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		NodeMetricDataService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, HeightMetricActions)) {
			this.notify(this.select())
		}
	}

	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[]) {
		if (isAnyMetricAvailable(nodeMetricData)) {
			this.reset(nodeMetricData)
		}
	}

	reset(nodeMetricData: NodeMetricData[]) {
		const { heightMetric } = this.storeService.getState().dynamicSettings

		if (isMetricUnavailable(nodeMetricData, heightMetric)) {
			const newHeightMetric = getMetricNameFromIndexOrLast(nodeMetricData, 1)
			this.storeService.dispatch(setHeightMetric(newHeightMetric))
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.heightMetric
	}

	private notify(newState: string) {
		this.$rootScope.$broadcast(HeightMetricService.HEIGHT_METRIC_CHANGED_EVENT, { heightMetric: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: HeightMetricSubscriber) {
		$rootScope.$on(HeightMetricService.HEIGHT_METRIC_CHANGED_EVENT, (_event_, data) => {
			subscriber.onHeightMetricChanged(data.heightMetric)
		})
	}
}
