import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { showMetricLabelNameValueSelector } from "../selectors/labelSettings.selectors"
import { setShowMetricLabelNameValue } from "../../../appearance/appearance.facade"

@Injectable({
    providedIn: "root"
})
export class ShowMetricLabelNameValueStore {
    constructor(private readonly store: Store<CcState>) {}

    showMetricLabelNameValue$ = this.store.select(showMetricLabelNameValueSelector)

    setShowMetricLabelNameValue(value: boolean) {
        this.store.dispatch(setShowMetricLabelNameValue({ value }))
    }
}
