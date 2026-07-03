import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { edgeMetricSelector } from "../../../mapState/mapState.read.facade"
import { setEdgeMetric } from "../../../mapState/mapState.write.facade"

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
