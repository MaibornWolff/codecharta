import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"

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
