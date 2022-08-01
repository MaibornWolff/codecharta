import { IRootScopeService } from "angular"
import { splitStateActions } from "./store/state.splitter"
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
		// See issue #2292:
		// Temporarily monkey patch so that store changes triggered by directly to store connected Angular's components
		// also notify $rootScope and keep existing logic. After full migration to Angular,
		// we still need to migrate the custom logic of `this.dispatch`. We could keep it through
		// adding a custom middleware, or moving to a thunk middleware.
		this.originalDispatch = Store.store.dispatch
		// @ts-ignore
		Store.store.dispatch = this.dispatch.bind(this)
	}

	dispatch(action: CCAction) {
		for (const atomicAction of splitStateActions(action)) {
			this.originalDispatch(atomicAction)
			this.notify(atomicAction.type)
		}
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
