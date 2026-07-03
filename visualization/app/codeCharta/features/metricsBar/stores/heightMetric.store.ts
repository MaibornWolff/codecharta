import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { heightMetricSelector } from "../../../mapState/mapState.read.facade"
import { setHeightMetric } from "../../../mapState/mapState.write.facade"

@Injectable({
    providedIn: "root"
})
export class HeightMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    heightMetric$ = this.store.select(heightMetricSelector)

    setHeightMetric(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }
}
