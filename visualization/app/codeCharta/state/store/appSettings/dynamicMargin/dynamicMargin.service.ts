import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { DynamicMarginActions } from "./dynamicMargin.actions"
import { isActionOfType } from "../../../../util/reduxHelper"

export interface DynamicMarginSubscriber {
	onDynamicMarginChanged(dynamicMargin: boolean)
}

export class DynamicMarginService implements StoreSubscriber {
	private static DYNAMIC_MARGIN_CHANGED_EVENT = "dynamic-margin-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, DynamicMarginActions)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.dynamicMargin
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(DynamicMarginService.DYNAMIC_MARGIN_CHANGED_EVENT, { dynamicMargin: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: DynamicMarginSubscriber) {
		$rootScope.$on(DynamicMarginService.DYNAMIC_MARGIN_CHANGED_EVENT, (_event_, data) => {
			subscriber.onDynamicMarginChanged(data.dynamicMargin)
		})
	}
}
