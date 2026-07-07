import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { metricDataSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class MetricDataStore {
    constructor(private readonly store: Store<CcState>) {}

    metricData$ = this.store.select(metricDataSelector)
}
