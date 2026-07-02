import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, tap, withLatestFrom } from "rxjs"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { nodeMetricDataSelector } from "../../selectors/nodeMetricData/nodeMetricData.selector"
import { areChosenMetricsAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { setAreaMetric, setColorMetric, setDistributionMetric, setHeightMetric } from "../../../mapState/mapState.facade"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "./utils/metricHelper"

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

export function setDefaultMetrics(store: Store<CcState>, nodeMetricData: NodeMetricData[]) {
    store.dispatch(setDistributionMetric({ value: getDefaultDistribution(nodeMetricData) }))

    let [defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = preselectCombination(nodeMetricData)
    if (!defaultedAreaMetric || !defaultedHeightMetric || !defaultedColorMetric) {
        ;[defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = defaultNMetrics(nodeMetricData, 3)
    }

    store.dispatch(setAreaMetric({ value: defaultedAreaMetric }))
    store.dispatch(setHeightMetric({ value: defaultedHeightMetric }))
    store.dispatch(setColorMetric({ value: defaultedColorMetric }))
}
