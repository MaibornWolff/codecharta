import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ShowMetricLabelNameValueActions } from "./showMetricLabelNameValue.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ShowMetricLabelNameValueSubscriber {
	onShowMetricLabelNameValueChanged(showMetricLabelNameValue: boolean)
}

export class LabelShowNodeNameService implements StoreSubscriber {
	private static SHOW_METRIC_LABEL_NAME_VALUE_CHANGED_EVENT = "show-metric-label-name-value-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ShowMetricLabelNameValueActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.showMetricLabelNameValue
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(LabelShowNodeNameService.SHOW_METRIC_LABEL_NAME_VALUE_CHANGED_EVENT, {
			showMetricLabelNameValue: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ShowMetricLabelNameValueSubscriber) {
		$rootScope.$on(LabelShowNodeNameService.SHOW_METRIC_LABEL_NAME_VALUE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onShowMetricLabelNameValueChanged(data.showMetricLabelNameValue)
		})
	}
}
