import { Injectable } from "@angular/core"
import { filter, withLatestFrom, map, distinctUntilChanged } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"

@Injectable()
export class ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect {
	constructor(private store: Store) {}

	resetSelectedEdgeMetricWhenItDoesntExistAnymore$ = createEffect(() =>
		this.store.select(metricDataSelector).pipe(
			withLatestFrom(this.store.select(edgeMetricSelector)),
			filter(([metricData, selectedEdgeMetric]) => !metricData.edgeMetricData.some(metric => metric.name === selectedEdgeMetric)),
			map(([metricData]) => metricData.edgeMetricData[0]?.name),
			distinctUntilChanged(),
			map(newEdgeMetric => setEdgeMetric(newEdgeMetric))
		)
	)
}
