import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../renderModel/primaryMetrics/primaryMetricNames.selector"

@Injectable({
    providedIn: "root"
})
export class PrimaryMetricsStore {
    constructor(private readonly store: Store<CcState>) {}

    primaryMetricNames$ = this.store.select(primaryMetricNamesSelector)
}
