import { Injectable } from "@angular/core"

import { Store as PlainStore } from "../store/store"

@Injectable({
	providedIn: "root"
})
export class State {
	getValue() {
		return PlainStore.store.getState()
	}
}
