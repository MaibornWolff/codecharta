import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { ShowMetricLabelNodeNameActions } from "./showMetricLabelNodeName.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface ShowMetricLabelNodeNameSubscriber {
	onShowMetricLabelNodeNameChanged(showMetricLabelNodeName: boolean)
}

export class LabelShowMetricValueService implements StoreSubscriber {
	private static SHOW_METRIC_LABEL_NODE_NAME_CHANGED_EVENT = "show-metric-label-node-name-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, ShowMetricLabelNodeNameActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.showMetricLabelNodeName
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(LabelShowMetricValueService.SHOW_METRIC_LABEL_NODE_NAME_CHANGED_EVENT, {
			showMetricLabelNodeName: newState
		})
	}

	static subscribe($rootScope: IRootScopeService, subscriber: ShowMetricLabelNodeNameSubscriber) {
		$rootScope.$on(LabelShowMetricValueService.SHOW_METRIC_LABEL_NODE_NAME_CHANGED_EVENT, (_event_, data) => {
			subscriber.onShowMetricLabelNodeNameChanged(data.showMetricLabelNodeName)
		})
	}
}
