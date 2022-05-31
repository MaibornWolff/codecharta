import { Inject, Injectable } from "@angular/core"
import { filter, map } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { dynamicMarginSelector } from "../../store/appSettings/dynamicMargin/dynamicMargin.selector"
import { defaultMargin, setMargin } from "../../store/dynamicSettings/margin/margin.actions"

@Injectable()
export class ResetDynamicMarginEffect {
	constructor(@Inject(Store) private store: Store) {}

	resetMargin$ = createEffect(() =>
		this.store.select(dynamicMarginSelector).pipe(
			filter(dynamicMargin => dynamicMargin),
			map(() => setMargin(defaultMargin))
		)
	)
}
