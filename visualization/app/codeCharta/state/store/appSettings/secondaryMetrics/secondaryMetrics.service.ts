import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { SecondaryMetricsActions } from "./secondaryMetrics.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { SecondaryMetric } from "../../../../ui/attributeSideBar/attributeSideBar.component"

export interface SecondaryMetricsSubscriber {
	onSecondaryMetricsChanged(secondaryMetrics: SecondaryMetric[])
}

export class SecondaryMetricsService implements StoreSubscriber {
	private static SECONDARY_METRICS_CHANGED_EVENT = "secondary-metrics-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, SecondaryMetricsActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.secondaryMetrics
	}

	private notify(newState: SecondaryMetric[]) {
		this.$rootScope.$broadcast(SecondaryMetricsService.SECONDARY_METRICS_CHANGED_EVENT, { secondaryMetrics: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: SecondaryMetricsSubscriber) {
		$rootScope.$on(SecondaryMetricsService.SECONDARY_METRICS_CHANGED_EVENT, (_event, data) => {
			subscriber.onSecondaryMetricsChanged(data.secondaryMetrics)
		})
	}
}
