import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { DynamicMarginActions } from "./dynamicMargin.actions"
import _ from "lodash"

export interface DynamicMarginSubscriber {
	onDynamicMarginChanged(dynamicMargin: boolean)
}

export class DynamicMarginService implements StoreSubscriber {
	private static DYNAMIC_MARGIN_CHANGED_EVENT = "dynamic-margin-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(DynamicMarginActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().appSettings.dynamicMargin
	}

	private notify(newState: boolean) {
		this.$rootScope.$broadcast(DynamicMarginService.DYNAMIC_MARGIN_CHANGED_EVENT, { dynamicMargin: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: DynamicMarginSubscriber) {
		$rootScope.$on(DynamicMarginService.DYNAMIC_MARGIN_CHANGED_EVENT, (event, data) => {
			subscriber.onDynamicMarginChanged(data.dynamicMargin)
		})
	}
}
