import { createStore, Store, Action } from "redux"
import rootReducer from "./store/reducer"
import { State } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { BlacklistSubscriber, SettingsEvents } from "./settingsService/settings.service.events"
import { BlacklistActions } from "./store/fileSettings/blacklist/blacklist.actions"

export class StoreService {
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
	}

	public getState(): State {
		return this.store.getState()
	}

	private notifyBlacklistSubscribers() {
		this.$rootScope.$broadcast(SettingsEvents.BLACKLIST_CHANGED_EVENT, { blacklist: this.getState().fileSettings.blacklist })
	}

	public static subscribeToBlacklist($rootScope: IRootScopeService, subscriber: BlacklistSubscriber) {
		$rootScope.$on(SettingsEvents.BLACKLIST_CHANGED_EVENT, (event, data) => {
			subscriber.onBlacklistChanged(data.blacklist)
		})
	}
}
