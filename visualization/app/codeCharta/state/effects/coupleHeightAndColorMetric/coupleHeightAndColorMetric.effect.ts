import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { combineLatest, filter, map } from "rxjs"
import { isHeightAndColorMetricLinkedSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

@Injectable()
export class CoupleHeightAndColorMetricEffect {
	constructor(@Inject(Store) private store: Store) {}

	coupleHeightAndColorMetric$ = createEffect(() =>
		combineLatest([this.store.select(heightMetricSelector), this.store.select(isHeightAndColorMetricLinkedSelector)]).pipe(
			filter(([, isHeightAndColorMetricLinked]) => isHeightAndColorMetricLinked),
			map(([heightMetric]) => setColorMetric(heightMetric))
		)
	)
}
