import { createStore, Store, Action } from "redux"
import rootReducer from "./store/reducer"
import { State } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { BlacklistSubscriber, SettingsEvents } from "./settingsService/settings.service.events"
import { BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"

export interface StoreSubscriber {
	onStoreChanged(actionType: string)
}

export class StoreService {
	private static STORE_CHANGED_EVENT = "store-changed"
	private store: Store

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		this.store = createStore(rootReducer)
	}

	public dispatch(action: Action) {
		this.store.dispatch(action)
		// Broadcast event that fits the action?
		if (Object.values(BlacklistActions).includes(action.type)) {
			this.notifyBlacklistSubscribers()
		}
		this.notify(action.type)
	}

	public getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType: actionType })
	}

	private notifyBlacklistSubscribers() {
		this.$rootScope.$broadcast(SettingsEvents.BLACKLIST_CHANGED_EVENT, { blacklist: this.getState().fileSettings.blacklist })
	}

	public static subscribeToStore($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (event, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}

	public static subscribeToBlacklist($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(SettingsEvents.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
