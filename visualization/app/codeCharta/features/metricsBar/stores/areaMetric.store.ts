import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

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
