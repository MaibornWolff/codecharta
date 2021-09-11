import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { CCAction } from "../../codeCharta.model"
import { CcState, Store as PlainStore } from "../store/store"

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
		PlainStore.store.dispatch(action)
	}
}
