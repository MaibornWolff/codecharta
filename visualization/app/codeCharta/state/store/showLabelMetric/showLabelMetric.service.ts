import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ShowLabelMetricActions } from "./showLabelMetric.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ShowLabelMetricSubscriber {
	onShowLabelMetricChanged(showLabelMetric: boolean)
}

export class ShowLabelMetricService implements StoreSubscriber {
	private static SHOW_LABEL_METRIC_CHANGED_EVENT = "show-label-metric-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ShowLabelMetricActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState()..showLabelMetric
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ShowLabelMetricService.SHOW_LABEL_METRIC_CHANGED_EVENT, { showLabelMetric: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ShowLabelMetricSubscriber) {
		$rootScope.$on(ShowLabelMetricService.SHOW_LABEL_METRIC_CHANGED_EVENT, (event, data) => {
			subscriber.onShowLabelMetricChanged(data.showLabelMetric)
		})
	}
}
