import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { first, tap } from "rxjs"
import { CcState, NodeMetricData } from "../../../model/codeCharta.model"
import { setDefaultMetrics } from "../../metricsBar/facade"
import { nodeMetricDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { setState } from "../../../stores/store/state.actions"
import { defaultState } from "../../../stores/store/state.manager"

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
