import { createStore, Store, Action } from "redux"
import { rootReducer } from "./store/reducer"
import { State } from "../codeCharta.model"
import { IRootScopeService } from "angular"

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
		this.notify(action.type)
	}

	public getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType: actionType })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (event, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}
}
