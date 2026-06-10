import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../selectors/edgeAndColors.selectors"

@Injectable({
    providedIn: "root"
})
export class AmountOfBuildingsWithSelectedEdgeMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    amountOfBuildingsWithSelectedEdgeMetric$ = this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector)
}
