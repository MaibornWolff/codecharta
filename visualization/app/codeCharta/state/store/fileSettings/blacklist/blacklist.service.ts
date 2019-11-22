import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { BlacklistItem } from "../../../../codeCharta.model"
import { BlacklistActions } from "./blacklist.actions"
import _ from "lodash"

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export class BlacklistService implements StoreSubscriber {
	private static BLACKLIST_CHANGED_EVENT = "blacklist-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribeToStore($rootScope, this)
	}

	public onStoreChanged(actionType) {
		if (_.values(BlacklistActions).includes(actionType)) {
			this.notify(this.select())
		}
	}

	private select() {
		return this.storeService.getState().fileSettings.blacklist
	}

	private notify(newState) {
		this.$rootScope.$broadcast(BlacklistService.BLACKLIST_CHANGED_EVENT, { blacklist: newState })
	}

	public static subscribeToBlacklist($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(BlacklistService.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
