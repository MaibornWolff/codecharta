import { Injectable } from "@angular/core"
import { filter, map, distinctUntilChanged } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { dynamicMarginSelector } from "../../store/appSettings/dynamicMargin/dynamicMargin.selector"
import { defaultMargin, setMargin } from "../../store/dynamicSettings/margin/margin.actions"

@Injectable()
export class ResetDynamicMarginEffect {
	constructor(private store: Store) {}

	resetMargin$ = createEffect(() =>
		this.store.select(dynamicMarginSelector).pipe(
			distinctUntilChanged(),
			filter(dynamicMargin => dynamicMargin),
			map(() => setMargin(defaultMargin))
		)
	)
}
