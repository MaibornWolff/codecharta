import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { colorMetricSelector } from "../../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"

@Injectable({
    providedIn: "root"
})
export class LegendColorMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    colorMetric$ = this.store.select(colorMetricSelector)
}
