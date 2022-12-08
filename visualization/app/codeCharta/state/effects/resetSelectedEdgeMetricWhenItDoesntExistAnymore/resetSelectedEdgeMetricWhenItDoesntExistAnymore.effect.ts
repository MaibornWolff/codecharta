import { Inject, Injectable } from "@angular/core"
import { distinctUntilChanged, filter, map, withLatestFrom } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { edgeMetricDataSelector } from "../../selectors/accumulatedData/metricData/edgeMetricData.selector"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"

@Injectable()
export class ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect {
	constructor(@Inject(Store) private store: Store) {}

	resetSelectedEdgeMetricWhenItDoesntExistAnymore$ = createEffect(() =>
		this.store.select(edgeMetricDataSelector).pipe(
			withLatestFrom(this.store.select(edgeMetricSelector)),
			filter(([edgeMetrics, selectedEdgeMetric]) => !edgeMetrics.some(metric => metric.key === selectedEdgeMetric)),
			map(([edgeMetrics]) => edgeMetrics[0]?.key),
			distinctUntilChanged(),
			map(newEdgeMetric => setEdgeMetric(newEdgeMetric))
		)
	)
}
