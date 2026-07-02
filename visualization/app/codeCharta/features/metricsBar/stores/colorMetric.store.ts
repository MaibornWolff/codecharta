import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setColorMetric, colorMetricSelector } from "../../../mapState/mapState.facade"

@Injectable({
    providedIn: "root"
})
export class ColorMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    colorMetric$ = this.store.select(colorMetricSelector)

    setColorMetric(value: string) {
        this.store.dispatch(setColorMetric({ value }))
    }
}
