/** Simple placeholder for ngrx's createEffect, so its introduction will become easier */

import { Action } from "redux"
import { Observable } from "rxjs"
import { Store } from "../../store/store"

type DontDispatchConfig = { dispatch: false }
type DispatchConfig = { dispatch?: true }
type Config = DispatchConfig | DontDispatchConfig

export function createEffect(source: () => Observable<unknown>, config?: Config) {
	source().subscribe(output => {
		if (config?.dispatch === false) return

		if (!isAction(output)) throw new Error("output must be an action")

		Store.dispatch(output)
	})
}

function isAction(something: unknown): something is Action {
	return something && Object.prototype.hasOwnProperty.call(something, "type")
}
