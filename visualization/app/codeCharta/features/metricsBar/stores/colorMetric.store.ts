import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"

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
