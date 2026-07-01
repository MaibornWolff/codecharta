import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { distinctUntilChanged, filter, map, withLatestFrom } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { edgeMetricDataSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"

@Injectable()
export class ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect {
    constructor(private readonly store: Store<CcState>) {}

    resetSelectedEdgeMetricWhenItDoesntExistAnymore$ = createEffect(() =>
        this.store.select(edgeMetricDataSelector).pipe(
            withLatestFrom(this.store.select(edgeMetricSelector)),
            filter(([edgeMetricData, selectedEdgeMetric]) => !edgeMetricData.some(metric => metric.name === selectedEdgeMetric)),
            map(([edgeMetricData]) => edgeMetricData[0]?.name),
            distinctUntilChanged(),
            map(newEdgeMetric => setEdgeMetric({ value: newEdgeMetric }))
        )
    )
}
