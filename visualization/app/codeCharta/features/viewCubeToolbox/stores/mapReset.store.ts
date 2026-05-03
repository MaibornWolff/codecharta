import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { first, tap } from "rxjs"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { setDefaultMetrics } from "../../../state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setState } from "../../../state/store/state.actions"
import { defaultState } from "../../../state/store/state.manager"

@Injectable({ providedIn: "root" })
export class MapResetStore {
    constructor(private readonly store: Store<CcState>) {}

    metricData$ = this.store.select(metricDataSelector)

    resetState() {
        this.store.dispatch(setState({ value: defaultState }))
    }

    setDefaultMetrics(nodeMetricData: NodeMetricData[]) {
        setDefaultMetrics(this.store, nodeMetricData)
    }

    resetMetricsToDefault() {
        this.metricData$
            .pipe(
                first(),
                tap(metricData => setDefaultMetrics(this.store, metricData.nodeMetricData))
            )
            .subscribe()
    }
}
