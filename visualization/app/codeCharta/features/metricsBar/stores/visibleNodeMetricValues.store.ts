import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"

@Injectable({
    providedIn: "root"
})
export class VisibleNodeMetricValuesStore {
    constructor(private readonly store: Store<CcState>) {}

    visibleNodeMetricValues$ = this.store.select(visibleNodeMetricValuesSelector)
}
