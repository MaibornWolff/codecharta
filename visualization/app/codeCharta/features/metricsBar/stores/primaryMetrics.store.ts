import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { primaryMetricNamesSelector } from "../../../renderer/renderModel/renderModel.facade"

@Injectable({
    providedIn: "root"
})
export class PrimaryMetricsStore {
    constructor(private readonly store: Store<CcState>) {}

    primaryMetricNames$ = this.store.select(primaryMetricNamesSelector)
}
