import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setShowMetricLabelNodeName } from "../../../stores/mapState/mapState.write.facade"
import { showMetricLabelNodeNameSelector } from "../selectors/labelSettings.selectors"

@Injectable({
    providedIn: "root"
})
export class ShowMetricLabelNodeNameStore {
    constructor(private readonly store: Store<CcState>) {}

    showMetricLabelNodeName$ = this.store.select(showMetricLabelNodeNameSelector)

    setShowMetricLabelNodeName(value: boolean) {
        this.store.dispatch(setShowMetricLabelNodeName({ value }))
    }
}
