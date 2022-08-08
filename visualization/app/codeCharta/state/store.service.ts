import { IRootScopeService } from "angular"
import { CCAction, State } from "../codeCharta.model"
import { Store } from "./store/store"

export interface StoreSubscriber {
	onStoreChanged(actionType: string)
}

export class StoreService {
	static STORE_CHANGED_EVENT = "store-changed"
	private store = Store.store
	private originalDispatch: typeof Store.store.dispatch

	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		// Temporarily monkey patch so that store changes triggered by directly to store connected Angular's components
		// also notify $rootScope and keep existing logic (refs #2292 / 2318).
		this.originalDispatch = Store.store.dispatch
		// @ts-ignore
		Store.store.dispatch = this.dispatch.bind(this)
	}

	dispatch(action: CCAction) {
		this.originalDispatch(action)
		this.notify(action.type)
	}

	getState(): State {
		return this.store.getState()
	}

	private notify(actionType: string) {
		this.$rootScope.$broadcast(StoreService.STORE_CHANGED_EVENT, { actionType })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: StoreSubscriber) {
		$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (_event_, data) => {
			subscriber.onStoreChanged(data.actionType)
		})
	}
}
