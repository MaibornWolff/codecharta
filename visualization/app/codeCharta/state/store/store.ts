import { createStore } from "redux"

import rootReducer from "./state.reducer"

type CcStore = ReturnType<typeof Store["createStore"]>
export type CcState = ReturnType<CcStore["getState"]>

export class Store {
	private static _store: CcStore

	private static createStore() {
		return createStore(rootReducer)
	}

	static get store() {
		if (!Store._store) Store._store = Store.createStore()
		return Store._store
	}
}
