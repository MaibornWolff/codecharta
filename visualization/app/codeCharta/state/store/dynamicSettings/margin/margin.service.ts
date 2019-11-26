import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { MarginActions } from "./margin.actions"
import _ from "lodash"

export interface MarginSubscriber {
	onMarginChanged(margin: number)
}

export class MarginService implements StoreSubscriber {
	private static MARGIN_CHANGED_EVENT = "margin-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe($rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (_.values(MarginActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().dynamicSettings.margin
	}

	private notify(newState: number) {
		this.$rootScope.$broadcast(MarginService.MARGIN_CHANGED_EVENT, { margin: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MarginSubscriber) {
		$rootScope.$on(MarginService.MARGIN_CHANGED_EVENT, (event, data) => {
			subscriber.onMarginChanged(data.margin)
		})
	}
}
