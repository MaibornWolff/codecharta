import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { areaMetricSelector } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class DistributionMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly areaMetric$ = this.store.select(areaMetricSelector)
}
