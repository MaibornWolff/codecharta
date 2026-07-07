import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, tap, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { nodeMetricDataSelector, areChosenMetricsAvailableSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { isAnyMetricAvailable } from "./utils/metricHelper"
import { setDefaultMetrics } from "./setDefaultMetrics"

@Injectable()
export class ResetChosenMetricsEffect {
    constructor(private readonly store: Store<CcState>) {}

    resetChosenDistributionMetric$ = createEffect(
        () =>
            this.store.select(nodeMetricDataSelector).pipe(
                filter(isAnyMetricAvailable),
                withLatestFrom(this.store.select(areChosenMetricsAvailableSelector)),
                filter(([, areChosenMetricsAvailable]) => !areChosenMetricsAvailable),
                tap(([nodeMetricData]) => {
                    setDefaultMetrics(this.store, nodeMetricData)
                })
            ),
        { dispatch: false }
    )
}
