import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { colorMetricSelector } from "../../../mapState/mapState.read.facade"
import { setColorMetric } from "../../../mapState/mapState.write.facade"

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
