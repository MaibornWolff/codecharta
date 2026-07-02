import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setAreaMetric, areaMetricSelector } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class AreaMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    areaMetric$ = this.store.select(areaMetricSelector)

    setAreaMetric(value: string) {
        this.store.dispatch(setAreaMetric({ value }))
    }
}
