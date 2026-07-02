import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setEdgeMetric, edgeMetricSelector } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class EdgeMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    edgeMetric$ = this.store.select(edgeMetricSelector)

    setEdgeMetric(value: string) {
        this.store.dispatch(setEdgeMetric({ value }))
    }
}
