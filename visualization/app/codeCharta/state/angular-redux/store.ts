import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { CCAction } from "../../codeCharta.model"
import { CcState, Store as PlainStore } from "../store/store"

type Selector<T> = (state: CcState) => T

// todo: Add tests

@Injectable({
	providedIn: "root"
})
export class Store {
	select<T>(selector: Selector<T>): Observable<T> {
		return new Observable<T>(subscriber => {
			let lastValue = selector(PlainStore.store.getState())
			subscriber.next(lastValue)
			return PlainStore.store.subscribe(() => {
				const newValue = selector(PlainStore.store.getState())
				if (lastValue !== newValue) {
					lastValue = newValue
					subscriber.next(newValue)
				}
			})
		})
	}

	dispatch(action: CCAction) {
		PlainStore.store.dispatch(action)
	}
}
