import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setShowMetricLabelNameValue } from "../../../stores/mapState/mapState.write.facade"
import { showMetricLabelNameValueSelector } from "../selectors/labelSettings.selectors"

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
