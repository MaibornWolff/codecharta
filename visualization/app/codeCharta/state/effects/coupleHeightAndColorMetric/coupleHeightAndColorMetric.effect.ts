import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { map, withLatestFrom } from "rxjs"
import { isHeightAndColorMetricCoupledSelector } from "../../store/appSettings/isHeightAndColorMetricCoupled/isHeightAndColorMetricCoupled.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"

@Injectable()
export class CoupleHeightAndColorMetricEffect {
	constructor(@Inject(Store) private store: Store) {}

	coupleHeightAndColorMetric$ = createEffect(() =>
		this.store.select(heightMetricSelector).pipe(
			withLatestFrom(this.store.select(isHeightAndColorMetricCoupledSelector), this.store.select(colorMetricSelector)),
			map(([heightMetric, isEnabled, colorMetric]) => {
				if (isEnabled) {
					return setColorMetric(heightMetric)
				}
				return setColorMetric(colorMetric)
			})
		)
	)
}
