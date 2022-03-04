import { Action } from "redux"
import { Observable, Subject } from "rxjs"
import { Store } from "../../store/store"

type DontDispatchConfig = { dispatch: false }
type DispatchConfig = { dispatch?: true }
type Config = DispatchConfig | DontDispatchConfig

/** Simple placeholder for NgRx's createEffect. The goal is to provide the
 * same api as NgRx, so that we can switch to NgRx in the long run.
 * Please note that its functionality is very minimal so far.
 */
export function createEffect<T>(source: () => Observable<T>, config?: Config) {
	const subjectOfEffect = new Subject<T>()

	source().subscribe(output => {
		if (!config || config.dispatch !== false) {
			if (!isAction(output)) {
				throw new Error("output must be an action")
			}
			Store.dispatch(output)
		}

		subjectOfEffect.next(output)
	})

	return subjectOfEffect as Observable<T>
}

function isAction(something: unknown): something is Action {
	return something && Object.prototype.hasOwnProperty.call(something, "type")
}
