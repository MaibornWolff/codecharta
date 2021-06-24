import { createStore } from "redux"

import rootReducer from "./state.reducer"

export class Store {
	private static _store: ReturnType<typeof Store.initStore>

	private static initStore() {
		return createStore(rootReducer)
	}

	static get store() {
		if (!Store._store) Store._store = Store.initStore()

		return Store._store
	}
}
