import { createStore, Store, Action } from "redux"
import rootReducer from "./store/reducer"
import { State } from "../codeCharta.model"

export class StoreService {
	private store: Store

	/* @ngInject */
	constructor() {
		this.store = createStore(rootReducer)
	}

	public dispatch(action: Action) {
		this.store.dispatch(action)
		// Broadcast event that fits the action?
	}

	public getState(): State {
		return this.store.getState()
	}
}
