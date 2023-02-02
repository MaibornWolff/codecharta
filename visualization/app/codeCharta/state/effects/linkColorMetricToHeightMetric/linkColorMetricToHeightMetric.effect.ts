import { Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { combineLatest, filter, map } from "rxjs"
import { isColorMetricLinkedToHeightMetricSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"

import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

@Injectable()
export class LinkColorMetricToHeightMetricEffect {
	constructor(private store: Store) {}

	linkHeightAndColorMetric$ = createEffect(() =>
		combineLatest([this.store.select(heightMetricSelector), this.store.select(isColorMetricLinkedToHeightMetricSelector)]).pipe(
			filter(([, isColorMetricLinkedToHeightMetric]) => isColorMetricLinkedToHeightMetric),
			map(([heightMetric]) => setColorMetric(heightMetric))
		)
	)
}
