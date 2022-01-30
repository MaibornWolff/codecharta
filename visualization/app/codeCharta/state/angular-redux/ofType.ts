import { Action } from "redux"
import { filter, map, Observable } from "rxjs"

export function ofType<T extends Action>(type: string) {
	return function (source: Observable<Action>) {
		return source.pipe(
			filter(action => action.type === type),
			map(action => action as T)
		)
	}
}
