import { createStore } from "redux"

import rootReducer from "./state.reducer"

type CcStore = ReturnType<typeof Store["createStore"]>
export type CcState = ReturnType<CcStore["getState"]>

export class Store {
	private static _store: CcStore

	private static createStore() {
		// @ts-ignore
		return createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__?.())
	}

	private static initialize() {
		Store._store = Store.createStore()
	}

	static get store() {
		if (!Store._store) Store.initialize()
		return Store._store
	}
}
