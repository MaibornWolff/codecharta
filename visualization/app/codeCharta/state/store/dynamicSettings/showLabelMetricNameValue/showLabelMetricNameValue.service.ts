import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ShowLabelMetricNameValueActions } from "./showLabelMetricNameValue.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ShowLabelMetricNameValueSubscriber {
	onShowLabelMetricNameValueChanged(showLabelMetricNameValue: boolean)
}

export class ShowLabelMetricNameValueService implements StoreSubscriber {
	private static SHOW_LABEL_METRIC_NAME_VALUE_CHANGED_EVENT = "show-label-metric-name-value-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ShowLabelMetricNameValueActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.showLabelMetricNameValue
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(ShowLabelMetricNameValueService.SHOW_LABEL_METRIC_NAME_VALUE_CHANGED_EVENT, { showLabelMetricNameValue: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: ShowLabelMetricNameValueSubscriber) {
		$rootScope.$on(ShowLabelMetricNameValueService.SHOW_LABEL_METRIC_NAME_VALUE_CHANGED_EVENT, (event, data) => {
			subscriber.onShowLabelMetricNameValueChanged(data.showLabelMetricNameValue)
		})
	}
}
