import { Action, createStore } from "redux"
import { EffectsModule } from "../angular-redux/effects/effects.module"

import rootReducer from "./state.reducer"

type CcStore = ReturnType<typeof Store["createStore"]>
export type CcState = ReturnType<CcStore["getState"]>

export class Store {
	private static _store: CcStore

	private static createStore() {
		return createStore(rootReducer)
	}

	private static initialize() {
		Store._store = Store.createStore()
		const originalDispatch = Store._store.dispatch
		// @ts-ignore
		Store._store.dispatch = function (action: Action) {
			originalDispatch(action)
			EffectsModule.actions$.next(action)
			return action
		}
	}

	static get store() {
		if (!Store._store) Store.initialize()
		return Store._store
	}

	static dispatch(action: Action) {
		Store.store.dispatch(action)
	}
}
