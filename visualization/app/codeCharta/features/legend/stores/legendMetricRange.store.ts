import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { metricRangeSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class LegendMetricRangeStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly selectedColorMetricData$ = this.store.select(metricRangeSelector)
}
