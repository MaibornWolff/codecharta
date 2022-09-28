import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { combineLatest, filter, map } from "rxjs"
import { isHeightAndColorMetricCoupledSelector } from "../../store/appSettings/isHeightAndColorMetricCoupled/isHeightAndColorMetricCoupled.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

@Injectable()
export class CoupleHeightAndColorMetricEffect {
	constructor(@Inject(Store) private store: Store) {}

	coupleHeightAndColorMetric$ = createEffect(() =>
		combineLatest([this.store.select(heightMetricSelector), this.store.select(isHeightAndColorMetricCoupledSelector)]).pipe(
			filter(([, isCouplingEnabled]) => isCouplingEnabled),
			map(([heightMetric]) => setColorMetric(heightMetric))
		)
	)
}
