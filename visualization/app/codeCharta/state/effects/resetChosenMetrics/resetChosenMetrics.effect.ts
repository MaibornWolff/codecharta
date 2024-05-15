import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, tap, withLatestFrom } from "rxjs"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { areChosenMetricsAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "./utils/metricHelper"

@Injectable()
export class ResetChosenMetricsEffect {
    constructor(private store: Store<CcState>) {}

    resetChosenDistributionMetric$ = createEffect(
        () =>
            this.store.select(metricDataSelector).pipe(
                map(metricData => metricData.nodeMetricData),
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
