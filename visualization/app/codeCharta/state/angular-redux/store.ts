import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { CCAction } from "../../codeCharta.model"
import { CcState, Store as PlainStore } from "../store/store"

/**
 * NgRx like connection to our redux store. The goal is to provide the
 * same api as NgRx, so that we can switch to NgRx in the long run.
 */
@Injectable({
	providedIn: "root"
})
export class Store {
	select<T>(selector: (state: CcState) => T): Observable<T> {
		return new Observable<T>(subscriber => {
			let lastValue = selector(PlainStore.store.getState())
			subscriber.next(lastValue)

			return PlainStore.store.subscribe(() => {
				const value = selector(PlainStore.store.getState())
				if (lastValue !== value) {
					lastValue = value
					subscriber.next(value)
				}
			})
		})
	}

	dispatch(action: CCAction) {
		PlainStore.dispatch(action)
	}
}
