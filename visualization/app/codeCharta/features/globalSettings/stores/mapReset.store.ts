import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { first, tap } from "rxjs"
import { CcState, NodeMetricData } from "../../../codeCharta.model"
import { setDefaultMetrics } from "../../../state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { nodeMetricDataSelector } from "../../../state/selectors/nodeMetricData/nodeMetricData.selector"
import { setState } from "../../../state/store/state.actions"
import { defaultState } from "../../../state/store/state.manager"

@Injectable({ providedIn: "root" })
export class MapResetStore {
    constructor(private readonly store: Store<CcState>) {}

    nodeMetricData$ = this.store.select(nodeMetricDataSelector)

    resetState() {
        this.store.dispatch(setState({ value: defaultState }))
    }

    setDefaultMetrics(nodeMetricData: NodeMetricData[]) {
        setDefaultMetrics(this.store, nodeMetricData)
    }

    resetMetricsToDefault() {
        this.nodeMetricData$
            .pipe(
                first(),
                tap(nodeMetricData => setDefaultMetrics(this.store, nodeMetricData))
            )
            .subscribe()
    }
}
