import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { areaMetricSelector } from "../../../mapState/mapState.read.facade"

@Injectable({
    providedIn: "root"
})
export class ExplorerAreaMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    areaMetric$ = this.store.select(areaMetricSelector)
}
